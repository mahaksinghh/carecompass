from typing import List, Optional
from pydantic import BaseModel, Field
from enum import Enum


class LanguageCode(str, Enum):
    EN = "en"
    HI = "hi"
    HINGLISH = "hinglish"


class ExtractedSymptom(BaseModel):
    concept: str = Field(..., description="Normalized symptom/concern concept key")
    raw_mention: str = Field(..., description="Original phrase extracted from input")
    severity: Optional[str] = Field(None, description="Reported severity: mild, moderate, severe")
    duration: Optional[str] = Field(None, description="Reported duration if available")
    negated: bool = Field(False, description="True if symptom was explicitly negated, e.g. 'no chest pain'")
    confidence: float = Field(1.0, ge=0.0, le=1.0, description="Extraction confidence score")


class IntakeParseRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000, description="Free-text health complaint")
    language: LanguageCode = Field(LanguageCode.EN, description="Primary input language")
    voice_used: bool = Field(False, description="Whether input was transcribed from voice speech")


class IntakeParseResponse(BaseModel):
    extracted_symptoms: List[ExtractedSymptom] = Field(default_factory=list)
    uncertainty_detected: bool = Field(False, description="Whether input is vague or requires clarification")
    clarification_needed: bool = Field(False)
    session_token: str = Field(..., description="Ephemeral session token; no raw health text stored permanently")


class FollowUpAnswer(BaseModel):
    question_id: str
    answer: str


class FollowUpQuestion(BaseModel):
    id: str
    text: str
    type: str = "choice"  # choice, boolean
    options: List[str] = Field(default_factory=list)
    why_asked: str = Field(..., description="Trust cue explaining clinical/practical reason for this question")


class FollowUpRequest(BaseModel):
    extracted_symptoms: List[ExtractedSymptom] = Field(default_factory=list)
    answered_questions: List[FollowUpAnswer] = Field(default_factory=list)
    language: LanguageCode = Field(LanguageCode.EN)


class FollowUpResponse(BaseModel):
    questions: List[FollowUpQuestion] = Field(default_factory=list)
    progress_percent: int = Field(..., ge=0, le=100)
    can_proceed: bool = True
