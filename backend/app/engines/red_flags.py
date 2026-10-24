"""
CareCompass Deterministic Red-Flag Rules Engine
Version: 1.0.0-deterministic
Notice: Prototype rule set for hackathon care-navigation. Requires qualified clinical review before real-world use.
"""

import re
from typing import List, Tuple, Optional
from app.schemas.triage import RedFlagTrigger, EmergencyInstructions


# Negation prefixes and suffixes across English, Hindi, and Hinglish
NEGATION_PATTERNS = [
    r"\bno\b",
    r"\bnot\b",
    r"\bwithout\b",
    r"\bdenies\b",
    r"\bdenied\b",
    r"\bnever\b",
    r"\bruled out\b",
    r"\bnahi\b",
    r"\bna\b",
    r"\bkoi .*? nahi\b",
    r"\bनहीं\b",
    r"\bबिना\b",
]

# Explicit red flag trigger categories with multi-language cues
RED_FLAG_DEFINITIONS = [
    {
        "flag_id": "FAST_STROKE",
        "category": "stroke_symptoms",
        "description": "Possible acute stroke symptoms (FAST: Face, Arms, Speech, Time)",
        "patterns": [
            r"droop(?:ing)?\s+(?:face|mouth|eye)",
            r"face\s+droop(?:ing)?",
            r"(?:cannot|can't)\s+(?:lift|raise)\s+(?:his|her|my)?\s*(?:arm|hand)",
            r"arm\s+(?:weakness|drift|numbness|paralysis)",
            r"slurr(?:ed|ing)\s+speech",
            r"speech\s+(?:is\s+)?slurr(?:ed|ing)",
            r"sudden\s+loss\s+of\s+speech",
            r"unable\s+to\s+speak\s+clearly",
            r"face\s+ek\s+taraf\s+jhuk",
            r"face\s+jhuk\s+gaya",
            r"haath\s+nahi\s+utha",
            r"bolne\s+me\s+(?:dikkat|takleef)",
            r"awaaz\s+ladkhada",
            r"चेहरा\s+(?:लटक|झुक)",
            r"बोल\s+नहीं\s+पा\s+रहे",
            r"हाथ\s+नहीं\s+उठा",
            r"स्ट्रोक",
        ],
    },
    {
        "flag_id": "CHEST_PAIN_CARDIAC",
        "category": "chest_pain_cardiac",
        "description": "Suspected acute coronary syndrome / cardiac chest pain",
        "patterns": [
            r"crushing\s+(?:chest\s+)?pressure",
            r"crushing\s+pain\s+(?:in\s+)?(?:center\s+of\s+)?(?:my\s+)?chest",
            r"chest\s+pain.*?(?:radiat|left\s+arm|jaw|back|cold\s+sweat)",
            r"severe\s+chest\s+pain",
            r"heart\s+attack",
            r"pressure\s+in\s+(?:the\s+)?(?:center\s+of\s+)?(?:my\s+)?chest",
            r"chest\s+me.*?(?:tez|bohot|heavy|dabav|dard)",
            r"seene\s+me.*?(?:tez|bohot|dard)",
            r"सीने\s+में.*?(?:तेज|दर्द|दबाव)",
            r"हार्ट\s+अटैक",
        ],
    },
    {
        "flag_id": "SEVERE_RESPIRATORY_DISTRESS",
        "category": "severe_breathing",
        "description": "Severe acute respiratory distress / cyanosis / airway compromise",
        "patterns": [
            r"gasping\s+for\s+air",
            r"cannot\s+breathe",
            r"can't\s+breathe",
            r"unable\s+to\s+breathe",
            r"lips\s+(?:are\s+)?turning\s+blue",
            r"blue\s+lips",
            r"suffocating",
            r"choking\s+and\s+cannot\s+breathe",
            r"stridor",
            r"saans\s+nahi\s+(?:aa|le)\s+rahi",
            r"saans\s+lene\s+me\s+bohot\s+(?:zyada\s+)?takleef",
            r"dam\s+ghut\s+raha",
            r"सांस\s+नहीं\s+आ\s+रही",
            r"दम\s+घुट\s+रहा",
            r"नीले\s+होंठ",
        ],
    },
    {
        "flag_id": "UNRESPONSIVE_COMA",
        "category": "unresponsiveness",
        "description": "Sudden loss of consciousness / unresponsiveness",
        "patterns": [
            r"unresponsive",
            r"collapsed.*?(?:unresponsive|won't\s+wake|unconscious)",
            r"lost\s+consciousness",
            r"not\s+waking\s+up",
            r"cannot\s+wake\s+(?:him|her|them)\s+up",
            r"behosh",
            r"hosh\s+nahi\s+hai",
            r"बेहोश",
            r"कोई\s+प्रतिक्रिया\s+नहीं",
        ],
    },
    {
        "flag_id": "PROLONGED_SEIZURE",
        "category": "prolonged_seizure",
        "description": "Prolonged convulsion (>5 minutes) or repeated seizures without recovery",
        "patterns": [
            r"(?:seiz|convuls).*?(?:>|over|longer\s+than|for)\s*(?:[5-9]|10|\d{2})\s*min",
            r"continuous\s+seizure",
            r"repeated\s+seizures",
            r"mirgi.*?(?:5|paanch)\s*minute\s*se\s*zyada",
            r"लगातार\s+दौरे",
            r"५\s+मिनट\s+से\s+ज्यादा\s+दौरा",
        ],
    },
    {
        "flag_id": "SEVERE_ARTERIAL_BLEEDING",
        "category": "severe_bleeding",
        "description": "Uncontrolled pulsatile arterial hemorrhage",
        "patterns": [
            r"blood\s+is\s+spurting",
            r"spurting\s+(?:out\s+)?in\s+pulses",
            r"bleeding\s+(?:heavily\s+)?and\s+won't\s+stop",
            r"soaking\s+through\s+(?:multiple\s+)?towels",
            r"khoon\s+rukk\s+nahi\s+raha",
            r"dhaar\s+ke\s+saath\s+khoon",
            r"खून\s+रुक\s+नहीं\s+रहा",
            r"फव्वारे\s+की\s+तरह\s+खून",
        ],
    },
    {
        "flag_id": "ANAPHYLAXIS",
        "category": "anaphylaxis",
        "description": "Acute anaphylactic reaction with respiratory or airway compromise",
        "patterns": [
            r"throat\s+is\s+swelling\s+tight",
            r"throat\s+(?:closing|swelling).*?(?:hives|allergy|peanut|sting)",
            r"anaphylaxis",
            r"severe\s+allergic\s+reaction.*?(?:throat|breath)",
            r"gala\s+band\s+ho\s+raha\s+hai.*?(?:allergy|chhati)",
            r"गला\s+सूज\s+कर\s+बंद",
            r"तीव्र\s+एलर्जी",
        ],
    },
    {
        "flag_id": "POISONING_INGESTION",
        "category": "suspected_poisoning",
        "description": "Suspected acute ingestion of toxic chemical, drug overdose, or poison",
        "patterns": [
            r"swallowed.*?(?:drain\s+cleaner|chemical|poison|pesticide|bleach)",
            r"drank.*?(?:acid|poison|pesticide|kerosene)",
            r"overdose\s+on\s+pills",
            r"zehar\s+kha\s+liya",
            r"poison\s+ingestion",
            r"acid\s+pi\s+liya",
            r"जहर\s+खा\s+लिया",
            r"कीटनाशक\s+पी\s+लिया",
        ],
    },
    {
        "flag_id": "MAJOR_TRAUMA",
        "category": "major_trauma",
        "description": "High-impact major traumatic injury / deformed skull / spinal risk",
        "patterns": [
            r"fell\s+from.*?(?:balcony|roof|window|2nd\s+floor|3rd\s+floor|height)",
            r"severe\s+head\s+deformity",
            r"bleeding\s+from\s+ears.*?(?:fall|accident|crash)",
            r"major\s+car\s+crash.*?(?:unconscious|trapped)",
            r"chhat\s+se\s+gir\s+gaye",
            r"sir\s+me\s+gambhir\s+chot",
            r"ऊंचाई\s+से\s+गिरे",
            r"गंभीर\s+दुर्घटना",
        ],
    },
    {
        "flag_id": "PREGNANCY_ACUTE_EMERGENCY",
        "category": "pregnancy_emergency",
        "description": "Acute obstetric emergency (third trimester hemorrhage, eclampsia, placental abruption)",
        "patterns": [
            r"pregnant.*?(?:heavy\s+bright\s+red|heavy\s+vaginal\s+bleeding)",
            r"(?:\d{1,2}\s*weeks?\s+pregnant).*?(?:bleeding|severe\s+abdominal\s+rigidity)",
            r"garbhvati.*?(?:khoon\s+beh\s+raha|tez\s+pet\s+dard)",
            r"गर्भवती.*?(?:रक्तस्राव|भारी\s+खून)",
        ],
    },
    {
        "flag_id": "SEVERE_BURNS",
        "category": "severe_burns",
        "description": "Extensive, high-degree, or electrical/chemical burns",
        "patterns": [
            r"burned.*?(?:both\s+arms|chest|face).*?(?:charred|peeling)",
            r"charred\s+white\s+and\s+peeling",
            r"explosion\s+burned",
            r"deep\s+third\s+degree\s+burn",
            r"aag\s+se\s+buri\s+tarah\s+jhulas",
            r"आग\s+से\s+बुरी\s+तरह\s+झुलस",
        ],
    },
    {
        "flag_id": "SELF_HARM_CRISIS",
        "category": "immediate_self_harm",
        "description": "Active self-harm attempt or immediate suicidal crisis",
        "patterns": [
            r"taken\s+pills\s+to\s+end\s+my\s+life",
            r"trying\s+to\s+kill\s+myself\s+right\s+now",
            r"active\s+suicide\s+attempt",
            r"hanging\s+myself",
            r"khudkushi\s+karne\s+laga\s+hoon",
            r"jaan\s+dene\s+ja\s+raha",
            r"आत्महत्या\s+करने",
        ],
    },
]


def is_cue_negated(text: str, match_start: int, match_end: int) -> bool:
    """
    Check if a matched cue is preceded or followed by negation tokens within a local window (30 chars).
    e.g., 'NO chest pain', 'koi chest pain nahi', 'without chest pain'.
    """
    # Look back window
    start_window = max(0, match_start - 35)
    prefix_text = text[start_window:match_start].lower()
    
    # Look forward window
    end_window = min(len(text), match_end + 35)
    suffix_text = text[match_end:end_window].lower()

    # Direct check on prefix
    for neg in [r"\bno\b", r"\bnot\b", r"\bwithout\b", r"\bdenies?\b", r"\bnever\b", r"\bkoi\b", r"\bना\b", r"\bनहीं\b", r"\bबिना\b"]:
        if re.search(neg, prefix_text):
            return True

    # Suffix check (common in Hindi/Hinglish: "chest pain nahi hai")
    for neg in [r"\bnahi\b", r"\bna\b", r"\bनहीं\b", r"\bnot\b"]:
        if re.search(neg, suffix_text):
            return True

    return False


def evaluate_red_flags(text: str) -> List[RedFlagTrigger]:
    """
    Deterministic red-flag evaluation.
    Evaluates raw text against certified red-flag regexes and excludes negated mentions.
    Returns list of triggered RedFlagTrigger objects.
    """
    clean_text = text.strip()
    triggered: List[RedFlagTrigger] = []

    for definition in RED_FLAG_DEFINITIONS:
        matched_cues = []
        for pattern in definition["patterns"]:
            for match in re.finditer(pattern, clean_text, re.IGNORECASE):
                # Verify if negated
                if not is_cue_negated(clean_text, match.start(), match.end()):
                    matched_cues.append(match.group(0))

        if matched_cues:
            triggered.append(
                RedFlagTrigger(
                    flag_id=definition["flag_id"],
                    category=definition["category"],
                    description=definition["description"],
                    matched_cues=list(set(matched_cues)),
                )
            )

    return triggered


def build_emergency_instructions(red_flags: List[RedFlagTrigger]) -> EmergencyInstructions:
    """
    Constructs immediate, standardized emergency safety instructions.
    """
    flag_names = ", ".join([f.flag_id.replace("_", " ") for f in red_flags])
    
    actions = [
        "Dial 112 (India) or your local emergency response service immediately.",
        "Do not wait for an online consultation or routine appointment.",
        "Keep the person in a safe position (seated comfortably if having chest or breathing difficulty, or in the recovery position on their side if vomiting or drowsy).",
        "If experiencing stroke symptoms, note the exact time symptoms first started for emergency doctors.",
        "Do not give food, water, or oral medication unless explicitly instructed by emergency medical dispatchers.",
    ]

    return EmergencyInstructions(
        primary_call_number="112",
        number_note="In India, call 112 for police, fire, or medical emergency dispatch. If in another country, call your national emergency number (e.g. 911, 999, 112).",
        immediate_actions=actions,
        disclaimer="CareCompass is an automated care-navigation prototype and CANNOT dispatch emergency services. Please contact local responders directly.",
    )
