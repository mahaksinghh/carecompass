from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum
from app.schemas.intake import ExtractedSymptom, FollowUpAnswer, LanguageCode


class UrgencyLevel(str, Enum):
    EMERGENCY = "EMERGENCY"
    URGENT_IN_PERSON = "URGENT_IN_PERSON"
    ROUTINE_CLINICAL = "ROUTINE_CLINICAL"
    NON_CLINICAL_SUPPORT = "NON_CLINICAL_SUPPORT"
    UNCERTAIN_ROUTINE = "UNCERTAIN_ROUTINE"


class RedFlagTrigger(BaseModel):
    flag_id: str
    category: str
    description: str
    matched_cues: List[str] = Field(default_factory=list)


class EmergencyInstructions(BaseModel):
    primary_call_number: str = "112"
    number_note: str = "In India, call 112 for all emergencies. If outside India, immediately dial your local emergency service."
    immediate_actions: List[str]
    disclaimer: str = "CareCompass is an automated prototype and CANNOT dispatch emergency services. Please contact local responders directly."


class TriageEvaluateRequest(BaseModel):
    text: str = Field(..., description="Original raw or clarified user statement")
    extracted_symptoms: List[ExtractedSymptom] = Field(default_factory=list)
    answers: List[FollowUpAnswer] = Field(default_factory=list)
    language: LanguageCode = Field(LanguageCode.EN)


class TriageEvaluateResponse(BaseModel):
    status: str = "evaluated"
    urgency_label: UrgencyLevel
    care_type: str
    is_emergency: bool
    emergency_instructions: Optional[EmergencyInstructions] = None
    red_flags_triggered: List[RedFlagTrigger] = Field(default_factory=list)
    reason_codes: List[str] = Field(default_factory=list)
    user_explanation: str
    uncertainty_message: Optional[str] = None
    next_steps: List[str] = Field(default_factory=list)
    caregiver_eligible: bool
    model_version: str = "carecompass-rules-v1.0-deterministic"
    disclaimer: str = (
        "CareCompass is a prototype for care navigation, not a medical diagnosis. "
        "It does not prescribe medicines or replace a clinician. "
        "If you may be experiencing an emergency, contact local emergency services immediately."
    )
