"""
CareCompass Reviewed Question Bank & Selector
Selects minimal, targeted follow-up questions without delaying urgent triage.
"""

from typing import List
from app.schemas.intake import FollowUpQuestion, FollowUpRequest, FollowUpResponse, LanguageCode


QUESTION_BANK = {
    "fever_cough": {
        "en": {
            "text": "Are you experiencing any shortness of breath, chest tightness, or confusion?",
            "why_asked": "To verify that your fever and cough are not causing dangerously low oxygen levels or respiratory distress.",
            "options": ["No, breathing normally", "Yes, slight tightness", "Yes, severe trouble breathing", "I'm not sure", "Prefer not to say"],
        },
        "hi": {
            "text": "क्या आपको सांस लेने में कोई परेशानी, सीने में जकड़न या चक्कर आ रहे हैं?",
            "why_asked": "यह जांचने के लिए कि बुखार या खांसी से सांस लेने में कोई गंभीर रुकावट तो नहीं है।",
            "options": ["नहीं, सांस सामान्य है", "हाँ, हल्की जकड़न है", "हाँ, सांस लेने में बहुत दिक्कत है", "मुझे पक्का नहीं पता", "बताना नहीं चाहते"],
        },
        "hinglish": {
            "text": "Kya aapko saans lene me koi dikkat, chest tightness ya chakkar aa rahe hain?",
            "why_asked": "Yeh ensure karne ke liye ki bukhar ya khansi se oxygen ya breathing me koi serious problem na ho.",
            "options": ["Nahi, normal breathing hai", "Haan, thodi tightness hai", "Haan, saans lene me bohot dikkat hai", "I'm not sure", "Prefer not to say"],
        },
    },
    "duration_progression": {
        "en": {
            "text": "How quickly did these symptoms develop, and are they getting rapidly worse?",
            "why_asked": "Sudden onset or rapid worsening helps clinicians distinguish acute conditions from gradual illnesses.",
            "options": ["Developed gradually over days", "Started suddenly within hours", "Getting rapidly worse right now", "I'm not sure", "Prefer not to say"],
        },
        "hi": {
            "text": "ये लक्षण कितनी तेजी से शुरू हुए, और क्या ये लगातार बढ़ रहे हैं?",
            "why_asked": "लक्षणों की शुरुआत की गति से डॉक्टर सही आपातकालीन स्थिति का निर्धारण कर पाते हैं।",
            "options": ["धीरे-धीरे कुछ दिनों में शुरू हुए", "अचानक कुछ घंटों में शुरू हुए", "अभी बहुत तेजी से बिगड़ रहे हैं", "मुझे पक्का नहीं पता", "बताना नहीं चाहते"],
        },
        "hinglish": {
            "text": "Yeh symptoms kitni jaldi shuru hue, aur kya yeh bohot fast badh rahe hain?",
            "why_asked": "Sudden onset ya fast worsening se acute problems identify hoti hain.",
            "options": ["Gradually kuch din me shuru hue", "Achanak kuch ghante me", "Abhi bohot tezi se badh rahe hain", "I'm not sure", "Prefer not to say"],
        },
    },
    "elder_caregiver_need": {
        "en": {
            "text": "What level of daily support is needed (e.g. mobility assistance, medication reminders, or companionship)?",
            "why_asked": "To accurately match verified caregivers with the specific non-clinical skills you require.",
            "options": ["Mobility & walking assistance", "Medication reminders & vitals monitoring", "Personal hygiene & bathing", "Companionship only", "I'm not sure", "Prefer not to say"],
        },
        "hi": {
            "text": "दैनिक देखभाल में किस प्रकार की मदद की आवश्यकता है?",
            "why_asked": "ताकि हम आपकी जरूरत के अनुसार सही कौशल वाले सहायक का मिलान कर सकें।",
            "options": ["चलने-फिरने में मदद", "दवाई याद दिलाना और बीपी/शुगर जांच", "नहलाने और स्वच्छता में सहायता", "केवल देखभाल और बातचीत", "मुझे पक्का नहीं पता", "बताना नहीं चाहते"],
        },
        "hinglish": {
            "text": "Daily care me kis tarah ki help chahiye (e.g. mobility, dawa ki reminder, ya personal care)?",
            "why_asked": "Aapki requirement ke hisaab se sahi caregiver profile match karne ke liye.",
            "options": ["Mobility aur chalne me help", "Medication reminder aur vitals check", "Personal hygiene aur bathing", "Companionship only", "I'm not sure", "Prefer not to say"],
        },
    },
    "vague_clarification": {
        "en": {
            "text": "Could you tell us which part of the body feels uncomfortable or what main sensation you notice?",
            "why_asked": "General descriptions need a specific focal area to give safe, transparent guidance.",
            "options": ["Head or neurological", "Chest or breathing", "Stomach or digestion", "Joints or muscles", "I'm not sure", "Prefer not to say"],
        },
        "hi": {
            "text": "क्या आप बता सकते हैं कि शरीर के किस हिस्से में सबसे ज्यादा असहजता या परेशानी महसूस हो रही है?",
            "why_asked": "स्पष्ट मार्गदर्शन देने के लिए शरीर के प्रभावित हिस्से की जानकारी जरूरी है।",
            "options": ["सिर या मानसिक तनाव", "छाती या सांस", "पेट या पाचन", "जोड़ या मांसपेशियां", "मुझे पक्का नहीं पता", "बताना नहीं चाहते"],
        },
        "hinglish": {
            "text": "Kya aap bata sakte hain ki body ke kis hisse me sabse zyada problem feel ho rahi hai?",
            "why_asked": "Safe direction suggest karne ke liye affected body area janna zaroori hai.",
            "options": ["Head ya neurological", "Chest ya breathing", "Stomach ya digestion", "Joints ya muscles", "I'm not sure", "Prefer not to say"],
        },
    },
}


def select_follow_up_questions(request: FollowUpRequest) -> FollowUpResponse:
    lang = request.language.value if request.language else "en"
    if lang not in ["en", "hi", "hinglish"]:
        lang = "en"

    # Count how many questions already answered
    answered_ids = {a.question_id for a in request.answered_questions}

    # Identify primary concepts
    positive_concepts = [s.concept for s in request.extracted_symptoms if not s.negated]
    questions: List[FollowUpQuestion] = []

    if any(c in ["elderly_care", "post_op_care", "mobility_issue"] for c in positive_concepts):
        qid = "elder_caregiver_need"
        if qid not in answered_ids:
            q_data = QUESTION_BANK[qid][lang]
            questions.append(FollowUpQuestion(id=qid, text=q_data["text"], options=q_data["options"], why_asked=q_data["why_asked"]))
    elif any(c in ["high_fever", "cough", "sore_throat"] for c in positive_concepts):
        qid = "fever_cough"
        if qid not in answered_ids:
            q_data = QUESTION_BANK[qid][lang]
            questions.append(FollowUpQuestion(id=qid, text=q_data["text"], options=q_data["options"], why_asked=q_data["why_asked"]))
    elif len(positive_concepts) == 0:
        qid = "vague_clarification"
        if qid not in answered_ids:
            q_data = QUESTION_BANK[qid][lang]
            questions.append(FollowUpQuestion(id=qid, text=q_data["text"], options=q_data["options"], why_asked=q_data["why_asked"]))
    
    # Generic progression check if we have room for 1 more and none answered yet
    if len(questions) < 2 and "duration_progression" not in answered_ids and len(positive_concepts) > 0:
        q_data = QUESTION_BANK["duration_progression"][lang]
        questions.append(FollowUpQuestion(id="duration_progression", text=q_data["text"], options=q_data["options"], why_asked=q_data["why_asked"]))

    # Max 2 questions total
    questions = questions[:2]
    progress = 50 if len(answered_ids) == 0 else (100 if len(questions) == 0 else 75)

    return FollowUpResponse(
        questions=questions,
        progress_percent=progress,
        can_proceed=True,
    )
