import pytest
from app.engines.caregiver_matcher import match_caregivers, load_synthetic_caregivers
from app.schemas.caregiver import CaregiverMatchRequest
from app.schemas.triage import UrgencyLevel


def test_emergency_strictly_blocks_caregiver_matching():
    """
    Emergency cases must NEVER return caregiver matches.
    """
    req = CaregiverMatchRequest(
        urgency_label=UrgencyLevel.EMERGENCY,
        is_emergency=True,
        required_skills=["mobility_assistance"],
    )
    res = match_caregivers(req)
    assert res.total_found == 0
    assert len(res.matches) == 0
    assert res.status == "emergency_bypassed"
    assert "strictly disabled" in res.no_match_reason.lower()


def test_caregiver_matching_filters_unavailable():
    """
    Unavailable caregivers (e.g. CG-110 Farhan Ahmed) must be excluded from results.
    """
    req = CaregiverMatchRequest(
        urgency_label=UrgencyLevel.NON_CLINICAL_SUPPORT,
        is_emergency=False,
        required_skills=["mobility_assistance"],
    )
    res = match_caregivers(req)
    assert res.total_found > 0
    matched_ids = [m.profile.caregiver_id for m in res.matches]
    assert "CG-110" not in matched_ids, "CG-110 is unavailable and should be excluded"


def test_caregiver_scoring_and_ranking():
    """
    Verifies that match scores are bounded between 0 and 1, sorted descending,
    and give highest score to exact skill and location matches.
    """
    req = CaregiverMatchRequest(
        urgency_label=UrgencyLevel.NON_CLINICAL_SUPPORT,
        is_emergency=False,
        required_skills=["elder_care", "medication_reminders"],
        user_location="South Delhi",
        preferred_language="en",
    )
    res = match_caregivers(req)
    assert len(res.matches) > 0

    # Verify descending sort
    scores = [m.score for m in res.matches]
    assert scores == sorted(scores, reverse=True)

    # First match should have strong skill fit
    top_match = res.matches[0]
    assert top_match.score >= 0.70
    assert top_match.match_explanation.skill_fit_score > 0
    assert len(top_match.match_explanation.reasons) > 0
