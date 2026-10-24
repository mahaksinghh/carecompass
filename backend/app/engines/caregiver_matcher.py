"""
CareCompass Caregiver Matching Engine
Deterministic, explainable ranking of fictional caregiver profiles.
Strict Safety Rule: Emergency cases immediately bypass and disable caregiver matching.
"""

import os
import csv
from typing import List, Dict, Any, Optional, Tuple
from app.schemas.caregiver import (
    CaregiverProfile,
    MatchExplanation,
    CaregiverMatchResult,
    CaregiverMatchRequest,
    CaregiverMatchResponse,
)
from app.schemas.triage import UrgencyLevel


DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "caregiver_profiles_synthetic.csv")


def load_synthetic_caregivers() -> List[CaregiverProfile]:
    profiles: List[CaregiverProfile] = []
    if not os.path.exists(DATA_PATH):
        return profiles

    with open(DATA_PATH, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            skills = [s.strip() for s in row["skills"].split(";") if s.strip()]
            languages = [l.strip() for l in row["languages"].split(";") if l.strip()]
            profiles.append(
                CaregiverProfile(
                    caregiver_id=row["caregiver_id"],
                    display_name=row["display_name"],
                    role=row["role"],
                    skills=skills,
                    languages=languages,
                    service_area=row["service_area"],
                    availability=row["availability"],
                    verified_status=(row["verified_status"].lower() == "true"),
                    eligibility_notes=row["eligibility_notes"],
                    demo_only=(row["demo_only"].lower() == "true"),
                )
            )
    return profiles


def calculate_match_score(
    profile: CaregiverProfile,
    required_skills: List[str],
    user_location: str,
    preferred_language: str,
) -> Tuple[float, MatchExplanation]:
    reasons = []

    # 1. Skill Fit (Weight: 40%)
    if required_skills:
        matched_skills = [s for s in required_skills if s in profile.skills]
        skill_score = min(1.0, len(matched_skills) / max(1, len(required_skills)))
        if matched_skills:
            reasons.append(f"Skills matched: {', '.join([s.replace('_', ' ') for s in matched_skills])}")
        else:
            skill_score = 0.2  # baseline general care skill
            reasons.append("General care skills available")
    else:
        skill_score = 0.8
        reasons.append("General caregiver capability")

    # 2. Availability (Weight: 25%)
    avail = profile.availability.lower()
    if avail == "immediate":
        avail_score = 1.0
        reasons.append("Available immediately for urgent support")
    elif avail == "today":
        avail_score = 0.8
        reasons.append("Available today for appointment")
    elif avail == "this_week":
        avail_score = 0.5
        reasons.append("Available later this week")
    else:
        avail_score = 0.0

    # 3. Service Area (Weight: 20%)
    loc = (user_location or "").strip().lower()
    prof_area = profile.service_area.lower()
    if loc and (loc in prof_area or prof_area in loc):
        area_score = 1.0
        reasons.append(f"Located in your primary service zone ({profile.service_area})")
    elif any(d in prof_area and d in loc for d in ["delhi", "noida", "gurgaon"]):
        area_score = 0.6
        reasons.append(f"Neighboring NCR region ({profile.service_area})")
    else:
        area_score = 0.3
        reasons.append(f"Service area: {profile.service_area}")

    # 4. Language Match (Weight: 15%)
    user_lang = (preferred_language or "en").lower()
    prof_langs = [l.lower() for l in profile.languages]
    if user_lang in prof_langs:
        lang_score = 1.0
        reasons.append(f"Speaks your preferred language ({user_lang})")
    elif user_lang in ["hi", "hinglish"] and any(l in prof_langs for l in ["hi", "hinglish"]):
        lang_score = 0.8
        reasons.append("Speaks Hindi / Hinglish")
    elif "en" in prof_langs:
        lang_score = 0.6
        reasons.append("Speaks English")
    else:
        lang_score = 0.2

    overall_score = round(
        (0.40 * skill_score) + (0.25 * avail_score) + (0.20 * area_score) + (0.15 * lang_score),
        2,
    )

    return (
        overall_score,
        MatchExplanation(
            skill_fit_score=round(skill_score, 2),
            availability_score=round(avail_score, 2),
            area_score=round(area_score, 2),
            language_score=round(lang_score, 2),
            overall_score=overall_score,
            reasons=reasons,
        ),
    )


def match_caregivers(request: CaregiverMatchRequest) -> CaregiverMatchResponse:
    # STRICT SAFETY CHECK: Emergencies must NEVER match caregivers
    if request.is_emergency or request.urgency_label == UrgencyLevel.EMERGENCY:
        return CaregiverMatchResponse(
            status="emergency_bypassed",
            matches=[],
            total_found=0,
            no_match_reason="Caregiver matching is strictly disabled for emergency cases. Immediate emergency medical response is required.",
            disclaimer="CareCompass enforces a zero-delay safety policy for medical emergencies.",
        )

    all_profiles = load_synthetic_caregivers()
    eligible_matches: List[CaregiverMatchResult] = []

    # Filter eligibility first: exclude unavailable
    for profile in all_profiles:
        if profile.availability.lower() == "unavailable":
            continue

        score, explanation = calculate_match_score(
            profile=profile,
            required_skills=request.required_skills,
            user_location=request.user_location or "South Delhi",
            preferred_language=request.preferred_language or "en",
        )

        eligible_matches.append(
            CaregiverMatchResult(
                profile=profile,
                score=score,
                match_explanation=explanation,
            )
        )

    # Deterministic ranking: sort by score descending
    eligible_matches.sort(key=lambda m: m.score, reverse=True)

    no_match_reason = None
    if not eligible_matches:
        no_match_reason = "No eligible caregivers found matching your criteria. Consider broadening your service area or required skills."

    return CaregiverMatchResponse(
        status="matched" if eligible_matches else "no_match",
        matches=eligible_matches,
        total_found=len(eligible_matches),
        no_match_reason=no_match_reason,
    )
