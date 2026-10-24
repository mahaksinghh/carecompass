import json
import os
import pytest
from app.engines.red_flags import evaluate_red_flags, build_emergency_instructions, is_cue_negated
from app.engines.router import evaluate_triage
from app.schemas.triage import TriageEvaluateRequest, UrgencyLevel
from app.schemas.intake import LanguageCode


DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "app", "data", "synthetic_triage_tests.json")


def load_synthetic_tests():
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def test_all_synthetic_emergencies_trigger_emergency_state():
    """
    Non-negotiable safety requirement:
    Every synthetic emergency test case MUST trigger an EMERGENCY state with 100% sensitivity.
    """
    tests = load_synthetic_tests()
    emergency_cases = [t for t in tests if t["expected_urgency"] == "EMERGENCY"]
    assert len(emergency_cases) >= 12, "Must contain all specified emergency categories"

    for case in emergency_cases:
        lang = LanguageCode(case["language"])
        req = TriageEvaluateRequest(text=case["input_text"], language=lang)
        res = evaluate_triage(req)

        assert res.urgency_label == UrgencyLevel.EMERGENCY, f"Failed on case {case['id']}: {case['input_text']}"
        assert res.is_emergency is True
        assert res.caregiver_eligible is False, f"Emergency case {case['id']} must NOT be eligible for caregiver matching"
        assert res.emergency_instructions is not None
        assert res.emergency_instructions.primary_call_number == "112"
        assert len(res.red_flags_triggered) > 0


def test_negation_handling_prevents_false_emergency():
    """
    Verify that explicit negation (e.g. 'no chest pain', 'koi chest pain nahi hai')
    does not trigger false positive emergency state.
    """
    negated_cases = [
        ("I sprained my wrist. There is NO chest pain and NO breathing trouble.", "en"),
        ("Ghutne me halki moch hai, koi chest pain nahi hai aur koi saans lene me takleef nahi hai.", "hinglish"),
        ("halka bukhar hai, seene me koi dard nahi hai.", "hinglish"),
    ]

    for text, lang in negated_cases:
        req = TriageEvaluateRequest(text=text, language=LanguageCode(lang))
        res = evaluate_triage(req)
        assert res.urgency_label != UrgencyLevel.EMERGENCY, f"Negation failed for: {text}"
        assert res.is_emergency is False


def test_emergency_instructions_content():
    """
    Verify 112 note and essential safety advice in emergency instructions.
    """
    flags = evaluate_red_flags("Crushing chest pain radiating to arm")
    instructions = build_emergency_instructions(flags)
    assert instructions.primary_call_number == "112"
    assert "India" in instructions.number_note
    assert any("112" in action for action in instructions.immediate_actions)
    assert "CANNOT dispatch" in instructions.disclaimer
