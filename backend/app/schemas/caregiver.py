from typing import List, Optional
from pydantic import BaseModel, Field
from app.schemas.triage import UrgencyLevel


class CaregiverProfile(BaseModel):
    caregiver_id: str
    display_name: str
    role: str
    skills: List[str]
    languages: List[str]
    service_area: str
    availability: str  # immediate, today, this_week, unavailable
    verified_status: bool
    eligibility_notes: str
    demo_only: bool = True


class MatchExplanation(BaseModel):
    skill_fit_score: float = Field(..., description="Weight 40%")
    availability_score: float = Field(..., description="Weight 25%")
    area_score: float = Field(..., description="Weight 20%")
    language_score: float = Field(..., description="Weight 15%")
    overall_score: float
    reasons: List[str] = Field(default_factory=list)


class CaregiverMatchResult(BaseModel):
    profile: CaregiverProfile
    score: float
    match_explanation: MatchExplanation


class CaregiverMatchRequest(BaseModel):
    urgency_label: UrgencyLevel
    is_emergency: bool = False
    required_skills: List[str] = Field(default_factory=list)
    user_location: Optional[str] = "South Delhi"
    preferred_language: Optional[str] = "en"


class CaregiverMatchResponse(BaseModel):
    status: str
    matches: List[CaregiverMatchResult] = Field(default_factory=list)
    total_found: int = 0
    no_match_reason: Optional[str] = None
    weights_info: str = "Demo weights: Skill fit 40%, Availability 25%, Service area 20%, Language 15%."
    disclaimer: str = (
        "Caregivers listed are fictional prototype profiles for non-clinical or post-diagnostic support. "
        "Caregivers are NOT licensed medical doctors unless explicitly verified."
    )
