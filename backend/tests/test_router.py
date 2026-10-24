import pytest
from app.engines.router import evaluate_triage
from app.schemas.triage import TriageEvaluateRequest, UrgencyLevel
from app.schemas.intake import LanguageCode, FollowUpAnswer


def test_urgent_in_person_routing():
    req = TriageEvaluateRequest(
        text="High fever 103F for 3 days with intense shivering and body pain",
        language=LanguageCode.EN,
    )
    res = evaluate_triage(req)
    assert res.urgency_label == UrgencyLevel.URGENT_IN_PERSON
    assert res.is_emergency is False
    assert "within 24 hours" in res.user_explanation.lower() or "within 24 hours" in " ".join(res.next_steps).lower()


def test_routine_clinical_routing():
    req = TriageEvaluateRequest(
        text="Mild runny nose and sore throat since yesterday, feeling a little tired",
        language=LanguageCode.EN,
    )
    res = evaluate_triage(req)
    assert res.urgency_label == UrgencyLevel.ROUTINE_CLINICAL
    assert res.is_emergency is False
    assert res.caregiver_eligible is True


def test_non_clinical_support_routing():
    req = TriageEvaluateRequest(
        text="Need a home caregiver to assist my elderly mother with walking and daily medication reminders",
        language=LanguageCode.EN,
    )
    res = evaluate_triage(req)
    assert res.urgency_label == UrgencyLevel.NON_CLINICAL_SUPPORT
    assert res.is_emergency is False
    assert res.caregiver_eligible is True


def test_vague_input_routes_to_uncertainty():
    req = TriageEvaluateRequest(
        text="I feel weird and strange.",
        language=LanguageCode.EN,
    )
    res = evaluate_triage(req)
    assert res.urgency_label == UrgencyLevel.UNCERTAIN_ROUTINE
    assert res.uncertainty_message is not None
    assert "uncertain" in res.uncertainty_message.lower() or "limited" in res.uncertainty_message.lower()
    assert res.caregiver_eligible is False


def test_secondary_escalation_from_followup():
    req = TriageEvaluateRequest(
        text="I have a mild fever",
        answers=[FollowUpAnswer(question_id="fever_cough", answer="Yes, severe trouble breathing")],
        language=LanguageCode.EN,
    )
    res = evaluate_triage(req)
    assert res.urgency_label == UrgencyLevel.EMERGENCY
    assert res.is_emergency is True
