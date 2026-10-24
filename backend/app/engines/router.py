"""
CareCompass Care-Routing Rules Engine
Version: 1.0.0-deterministic
Determines cautious provisional next-step category, transparency reason codes, and patient guidance.
"""

import re
from typing import List, Optional
from app.schemas.triage import (
    UrgencyLevel,
    RedFlagTrigger,
    TriageEvaluateRequest,
    TriageEvaluateResponse,
    EmergencyInstructions,
)
from app.schemas.intake import LanguageCode
from app.engines.red_flags import evaluate_red_flags, build_emergency_instructions
from app.engines.nlp_parser import parse_intake, IntakeParseRequest


def evaluate_triage(request: TriageEvaluateRequest) -> TriageEvaluateResponse:
    # 1. Deterministic Red-Flag Safety Layer (Runs FIRST and CANNOT be bypassed)
    red_flags: List[RedFlagTrigger] = evaluate_red_flags(request.text)

    # Check answers from follow-up questions for secondary emergency escalation
    for ans in request.answers:
        if ans.question_id == "fever_cough" and "severe trouble breathing" in ans.answer.lower():
            if not any(f.flag_id == "SEVERE_RESPIRATORY_DISTRESS" for f in red_flags):
                red_flags.append(
                    RedFlagTrigger(
                        flag_id="SEVERE_RESPIRATORY_DISTRESS",
                        category="severe_breathing",
                        description="Severe respiratory distress reported during follow-up assessment",
                        matched_cues=["severe trouble breathing from follow-up"],
                    )
                )
        if ans.question_id == "duration_progression" and "getting rapidly worse" in ans.answer.lower():
            # Flag acute escalation
            pass

    lang = request.language.value if request.language else "en"

    # Emergency state triggered
    if red_flags:
        emergency_instructions = build_emergency_instructions(red_flags)
        
        explanation_map = {
            "en": "Warning: Based on your description, you reported indicators that require immediate medical attention. CareCompass has stopped ordinary routing and recommends calling emergency services directly.",
            "hi": "चेतावनी: आपके विवरण के आधार पर ऐसे गंभीर लक्षण पाए गए हैं जिनमें तत्काल आपातकालीन चिकित्सा की आवश्यकता है। कृपया तुरंत 112 या स्थानीय आपातकालीन सेवा पर संपर्क करें।",
            "hinglish": "Warning: Aapke description ke according serious emergency signs detect hue hain jisme immediate medical attention zaroori hai. Please turant 112 ya emergency services ko call karein.",
        }
        
        next_steps = [
            "Call 112 (India) or your national emergency number immediately.",
            "Stay with the person in a calm, safe environment.",
            "Do not consume food, water, or unprescribed pills until assessed by emergency medical crew.",
        ]

        return TriageEvaluateResponse(
            status="emergency_divert",
            urgency_label=UrgencyLevel.EMERGENCY,
            care_type="Emergency care now",
            is_emergency=True,
            emergency_instructions=emergency_instructions,
            red_flags_triggered=red_flags,
            reason_codes=[f.flag_id for f in red_flags],
            user_explanation=explanation_map.get(lang, explanation_map["en"]),
            uncertainty_message=None,
            next_steps=next_steps,
            caregiver_eligible=False,  # STRICT: Emergency bypasses caregiver matching
        )

    # 2. Extract symptoms if not already supplied
    symptoms = request.extracted_symptoms
    if not symptoms:
        parsed = parse_intake(IntakeParseRequest(text=request.text, language=request.language))
        symptoms = parsed.extracted_symptoms
        uncertainty_detected = parsed.uncertainty_detected
    else:
        uncertainty_detected = len(symptoms) == 0

    positive_concepts = [s.concept for s in symptoms if not s.negated]
    
    # 3. Handle vague / ambiguous low confidence
    vague_markers = ["weird", "strange", "kuch ajeeb", "samajh nahi"]
    if uncertainty_detected or (len(positive_concepts) == 0 and any(vm in request.text.lower() for vm in vague_markers)):
        explanation_map = {
            "en": "We were unable to identify a clear clinical or support pattern from your entered notes. Because symptoms can be uncertain, we recommend consulting a healthcare professional for an in-person assessment.",
            "hi": "दर्ज किए गए विवरण से कोई स्पष्ट लक्षण या पैटर्न निर्धारित नहीं हो सका। अनिश्चितता के कारण, हम व्यक्तिगत रूप से डॉक्टर से परामर्श लेने की सलाह देते हैं।",
            "hinglish": "Entered description se koi clear clinical pattern match nahi ho paya. Uncertainty ki wajah se hum recommend karte hain ki aap doctor se checkup karwayen.",
        }
        return TriageEvaluateResponse(
            status="evaluated_uncertain",
            urgency_label=UrgencyLevel.UNCERTAIN_ROUTINE,
            care_type="Inconclusive guidance - Consult a clinician",
            is_emergency=False,
            emergency_instructions=None,
            red_flags_triggered=[],
            reason_codes=["UNCERTAIN_LOW_CONFIDENCE"],
            user_explanation=explanation_map.get(lang, explanation_map["en"]),
            uncertainty_message="Information is limited, contradictory, or out-of-scope. No confident routing can be made without clinical evaluation.",
            next_steps=[
                "Schedule a checkup with a licensed doctor or visit a general practitioner.",
                "Observe if your symptoms change, worsen, or develop new red flags.",
                "If severe symptoms develop, seek emergency care immediately.",
            ],
            caregiver_eligible=False,
        )

    # 4. Check Non-Clinical Support / Caregiver Needs
    if any(c in ["elderly_care", "post_op_care"] for c in positive_concepts) or "caregiver" in request.text.lower() or "सहायक" in request.text:
        explanation_map = {
            "en": "Your request indicates a need for non-clinical home support, companionship, or assistance with daily routines. No acute medical emergency was identified.",
            "hi": "आपकी आवश्यकता गैर-चिकित्सीय घरेलू सहायता, साथी या दैनिक देखभाल से संबंधित है। कोई आपातकालीन लक्षण नहीं पाया गया है।",
            "hinglish": "Aapki requirement non-clinical home care, companionship ya daily routine help se related hai. Koi emergency symptom nahi mila.",
        }
        return TriageEvaluateResponse(
            status="evaluated_support",
            urgency_label=UrgencyLevel.NON_CLINICAL_SUPPORT,
            care_type="Non-clinical supportive care",
            is_emergency=False,
            emergency_instructions=None,
            red_flags_triggered=[],
            reason_codes=["NON_CLINICAL_REQUEST", *positive_concepts],
            user_explanation=explanation_map.get(lang, explanation_map["en"]),
            uncertainty_message=None,
            next_steps=[
                "Browse and connect with verified non-clinical caregiver profiles below.",
                "Review required skills, language, and service radius.",
                "Ensure any prescribed medications or clinical treatments are supervised by a licensed physician.",
            ],
            caregiver_eligible=True,
        )

    # 5. Check Urgent In-Person Medical Assessment
    urgent_triggers = ["high_fever", "mobility_issue"]
    is_urgent = any(c in urgent_triggers for c in positive_concepts) or any(
        s.severity == "severe" for s in symptoms if not s.negated
    )

    if is_urgent:
        explanation_map = {
            "en": "Your reported symptoms (such as high fever or acute pain/mobility difficulty) suggest that you should receive a timely in-person evaluation by a qualified medical professional within 24 hours.",
            "hi": "आपके लक्षण (जैसे तेज बुखार या चलने में तीव्र दर्द) संकेत करते हैं कि आपको २४ घंटे के भीतर किसी योग्य डॉक्टर या क्लिनिक में व्यक्तिगत जांच करानी चाहिए।",
            "hinglish": "Aapke reported symptoms (jaise high fever ya chalne me tez dard) indicate karte hain ki aapko 24 hours ke andar doctor ya clinic me physical checkup karwana chahiye.",
        }
        return TriageEvaluateResponse(
            status="evaluated_urgent",
            urgency_label=UrgencyLevel.URGENT_IN_PERSON,
            care_type="Urgent in-person medical assessment",
            is_emergency=False,
            emergency_instructions=None,
            red_flags_triggered=[],
            reason_codes=["URGENT_ASSESSMENT_REQUIRED", *positive_concepts],
            user_explanation=explanation_map.get(lang, explanation_map["en"]),
            uncertainty_message="Symptoms require timely professional examination. If conditions suddenly deteriorate, contact 112.",
            next_steps=[
                "Visit an urgent care center, primary health clinic, or hospital outpatient department within 24 hours.",
                "Keep hydrated, monitor your temperature, and rest.",
                "If you need an escort to the clinic or home companionship, you may view eligible support assistants.",
            ],
            caregiver_eligible=True,
        )

    # 6. Default Routine Clinician Consultation
    explanation_map = {
        "en": "Your symptoms appear consistent with a mild or routine health concern. We suggest scheduling a standard outpatient consultation with a healthcare provider if symptoms persist.",
        "hi": "आपके लक्षण सामान्य स्वास्थ्य परेशानी के अनुकूल प्रतीत होते हैं। यदि लक्षण बने रहते हैं, तो सामान्य ओपीडी डॉक्टर से परामर्श लें।",
        "hinglish": "Aapke symptoms mild ya routine health concern lagte hain. Agar yeh persist karein toh normal clinic me doctor se consult karein.",
    }
    return TriageEvaluateResponse(
        status="evaluated_routine",
        urgency_label=UrgencyLevel.ROUTINE_CLINICAL,
        care_type="Routine clinician appointment",
        is_emergency=False,
        emergency_instructions=None,
        red_flags_triggered=[],
        reason_codes=["ROUTINE_MONITORING", *positive_concepts],
        user_explanation=explanation_map.get(lang, explanation_map["en"]),
        uncertainty_message="This suggestion is provisional. Only a qualified clinician can make a diagnosis.",
        next_steps=[
            "Schedule a routine appointment with a family doctor or primary clinic.",
            "Monitor your symptoms over the next 48 to 72 hours.",
            "Seek urgent care if you develop high fever, difficulty breathing, or severe pain.",
        ],
        caregiver_eligible=True,
    )
