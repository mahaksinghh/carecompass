"""
CareCompass NLP Parser & Symptom Extraction Module
Extracts structured symptom concepts, duration, reported severity, and negation.
Provides 100% offline rule-based extraction with multi-lingual support (English, Hindi, Hinglish).
"""

import re
import uuid
from typing import List, Tuple, Optional
from app.schemas.intake import ExtractedSymptom, IntakeParseRequest, IntakeParseResponse, LanguageCode


CONCEPT_VOCABULARY = [
    {
        "concept": "chest_pain",
        "patterns": [r"chest\s+pain", r"crushing\s+pressure", r"seene\s+me\s+dard", r"सीने\s+में\s+दर्द", r"chest\s+me\s+dard"],
    },
    {
        "concept": "breathing_difficulty",
        "patterns": [r"shortness\s+of\s+breath", r"cannot\s+breathe", r"saans\s+lene\s+me\s+dikkat", r"saans\s+fool", r"सांस\s+फूल", r"breathless"],
    },
    {
        "concept": "high_fever",
        "patterns": [r"high\s+fever", r"10[1-5]\s*(?:f|degrees|°f)?", r"tez\s+bukhar", r"fever", r"bukhar", r"बुखार"],
    },
    {
        "concept": "cough",
        "patterns": [r"productive\s+green\s+cough", r"cough(?:ing)?", r"khansi", r"खांसी"],
    },
    {
        "concept": "sore_throat",
        "patterns": [r"sore\s+throat", r"gale\s+me\s+kharash", r"gala\s+kharab", r"गले\s+में\s+खराश"],
    },
    {
        "concept": "headache",
        "patterns": [r"headache", r"sar\s+dard", r"sir\s+dard", r"सिर\s+दर्द"],
    },
    {
        "concept": "mobility_issue",
        "patterns": [r"mobility", r"cannot\s+walk", r"trouble\s+walking", r"chalne\s+me\s+takleef", r"chalne\s+me\s+help", r"चलने\s+में\s+मदद", r"sprained\s+ankle", r"knee\s+pain", r"ghutne\s+me\s+dard"],
    },
    {
        "concept": "elderly_care",
        "patterns": [r"elderly\s+care", r"home\s+caregiver", r"8\d-year-old", r"mother\s+needs\s+help", r"dadi\s+ke\s+liye", r"दादी\s+के\s+लिए", r"caregiver\s+chahiye"],
    },
    {
        "concept": "post_op_care",
        "patterns": [r"post-op", r"after\s+surgery", r"operation\s+ke\s+baad", r"wound\s+dressing", r"dressing\s+aur\s+dava", r"ऑपरेशन\s+के\s+बाद"],
    },
    {
        "concept": "nausea_vomiting",
        "patterns": [r"vomit(?:ing)?", r"nausea", r"ulti", r"जी\s+मिचलाना", r"उल्टी"],
    },
    {
        "concept": "dizziness",
        "patterns": [r"dizziness", r"dizzy", r"lightheaded", r"chakkar", r"चक्कर"],
    },
]

SEVERITY_PATTERNS = {
    "severe": [r"severe", r"crushing", r"unbearable", r"bohot\s+tez", r"bohot\s+zyada", r"बहुत\s+तेज", r"तीव्र"],
    "moderate": [r"moderate", r"medium", r"theek-thaak"],
    "mild": [r"mild", r"slight", r"halka", r"thoda", r"हल्का", r"थोड़ा"],
}

DURATION_PATTERNS = [
    r"(\d+\s*(?:days?|weeks?|months?|hours?|minutes?|din)\s*(?:ago|se)?)",
    r"(since\s+yesterday|kal\s+se|कल\s+से)",
    r"(for\s+\d+\s*(?:days?|hours?|weeks?))",
    r"(\d+\s*din\s*se)",
]

NEGATION_TERMS = [r"\bno\b", r"\bnot\b", r"\bwithout\b", r"\bdenies\b", r"\bkoi\b", r"\bnahi\b", r"\bनहीं\b", r"\bना\b"]


def extract_duration(text: str) -> Optional[str]:
    for pat in DURATION_PATTERNS:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            return m.group(0).strip()
    return None


def extract_severity(text: str) -> Optional[str]:
    for sev, patterns in SEVERITY_PATTERNS.items():
        for pat in patterns:
            if re.search(pat, text, re.IGNORECASE):
                return sev
    return None


def parse_intake(request: IntakeParseRequest) -> IntakeParseResponse:
    text = request.text.strip()
    session_token = f"sess_{uuid.uuid4().hex[:12]}"
    
    extracted: List[ExtractedSymptom] = []
    text_lower = text.lower()

    duration = extract_duration(text)
    overall_severity = extract_severity(text)

    for item in CONCEPT_VOCABULARY:
        concept = item["concept"]
        for pat in item["patterns"]:
            match = re.search(pat, text, re.IGNORECASE)
            if match:
                mention = match.group(0)
                # Check negation in surrounding text
                start = max(0, match.start() - 30)
                end = min(len(text), match.end() + 30)
                context = text[start:end].lower()

                is_negated = False
                for neg in NEGATION_TERMS:
                    if re.search(neg, context):
                        is_negated = True
                        break

                # Avoid duplicate concepts
                if not any(e.concept == concept for e in extracted):
                    extracted.append(
                        ExtractedSymptom(
                            concept=concept,
                            raw_mention=mention,
                            severity=overall_severity or ("mild" if "halka" in context or "mild" in context else "moderate"),
                            duration=duration,
                            negated=is_negated,
                            confidence=0.92,
                        )
                    )
                break

    # Uncertainty detection: text is too brief (< 15 chars) or contains vague words
    vague_markers = [r"weird", r"strange", r"something wrong", r"kuch ajeeb", r"kuch samajh nahi aa raha", r"not sure what"]
    uncertain = len(text) < 15 or any(re.search(vm, text, re.IGNORECASE) for vm in vague_markers) or len(extracted) == 0

    return IntakeParseResponse(
        extracted_symptoms=extracted,
        uncertainty_detected=uncertain,
        clarification_needed=uncertain,
        session_token=session_token,
    )
