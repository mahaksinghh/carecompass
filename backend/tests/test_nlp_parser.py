import pytest
from app.engines.nlp_parser import parse_intake, extract_duration, extract_severity
from app.schemas.intake import IntakeParseRequest, LanguageCode


def test_symptom_extraction_english():
    req = IntakeParseRequest(
        text="I have had a high fever and sore throat for 3 days",
        language=LanguageCode.EN,
    )
    res = parse_intake(req)
    concepts = [s.concept for s in res.extracted_symptoms]
    assert "high_fever" in concepts
    assert "sore_throat" in concepts
    assert res.extracted_symptoms[0].duration is not None
    assert "3 days" in res.extracted_symptoms[0].duration


def test_symptom_extraction_hindi():
    req = IntakeParseRequest(
        text="दो दिन से तेज बुखार और खांसी है",
        language=LanguageCode.HI,
    )
    res = parse_intake(req)
    concepts = [s.concept for s in res.extracted_symptoms]
    assert "high_fever" in concepts or "cough" in concepts


def test_symptom_extraction_hinglish():
    req = IntakeParseRequest(
        text="Mujhe kal se halka sar dard aur gala kharab hai",
        language=LanguageCode.HINGLISH,
    )
    res = parse_intake(req)
    concepts = [s.concept for s in res.extracted_symptoms]
    assert "headache" in concepts
    assert "sore_throat" in concepts


def test_negation_in_symptom_parser():
    req = IntakeParseRequest(
        text="I have an ankle injury, but no chest pain and no breathing trouble",
        language=LanguageCode.EN,
    )
    res = parse_intake(req)
    chest_symptom = next((s for s in res.extracted_symptoms if s.concept == "chest_pain"), None)
    if chest_symptom:
        assert chest_symptom.negated is True


def test_vague_input_uncertainty_flag():
    req = IntakeParseRequest(
        text="I feel weird and strange",
        language=LanguageCode.EN,
    )
    res = parse_intake(req)
    assert res.uncertainty_detected is True
