"""
CareCompass Prototype Backend API
FastAPI service providing deterministic safety routing, intake parsing, and caregiver matching.
"""

import os
import json
from typing import Dict, Any, List
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.schemas.intake import (
    LanguageCode,
    IntakeParseRequest,
    IntakeParseResponse,
    FollowUpRequest,
    FollowUpResponse,
)
from app.schemas.triage import (
    TriageEvaluateRequest,
    TriageEvaluateResponse,
)
from app.schemas.caregiver import (
    CaregiverMatchRequest,
    CaregiverMatchResponse,
)
from app.engines.nlp_parser import parse_intake
from app.engines.questions import select_follow_up_questions
from app.engines.router import evaluate_triage
from app.engines.caregiver_matcher import match_caregivers, load_synthetic_caregivers
from app.utils.audit_log import record_safety_event, get_safety_logs, clear_safety_logs

app = FastAPI(
    title="CareCompass API",
    description=(
        "Care-navigation and caregiver-matching hackathon prototype. "
        "Strictly non-diagnostic; enforces deterministic red-flag safety routing."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For hackathon prototype; can be restricted in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["System"])
def health_check() -> Dict[str, Any]:
    return {
        "status": "healthy",
        "service": "CareCompass API",
        "version": "1.0.0",
        "red_flag_engine": "deterministic-v1.0",
    }


@app.get("/api/v1/languages", tags=["Intake"])
def get_supported_languages() -> List[Dict[str, str]]:
    return [
        {"code": "en", "name": "English", "native": "English", "direction": "ltr"},
        {"code": "hi", "name": "Hindi", "native": "हिन्दी", "direction": "ltr"},
        {"code": "hinglish", "name": "Hinglish", "native": "Hinglish", "direction": "ltr"},
    ]


@app.post("/api/v1/intake/parse", response_model=IntakeParseResponse, tags=["Intake"])
def parse_health_concern(request: IntakeParseRequest) -> IntakeParseResponse:
    try:
        return parse_intake(request)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@app.post("/api/v1/intake/follow-up", response_model=FollowUpResponse, tags=["Intake"])
def get_follow_up_questions(request: FollowUpRequest) -> FollowUpResponse:
    try:
        return select_follow_up_questions(request)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@app.post("/api/v1/triage/evaluate", response_model=TriageEvaluateResponse, tags=["Triage"])
def evaluate_patient_triage(request: TriageEvaluateRequest) -> TriageEvaluateResponse:
    try:
        result = evaluate_triage(request)
        # Log anonymized safety event
        record_safety_event(
            event_type="triage_evaluation",
            urgency_label=result.urgency_label.value,
            red_flag_ids=[f.flag_id for f in result.red_flags_triggered],
            language=request.language.value,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.post("/api/v1/caregivers/match", response_model=CaregiverMatchResponse, tags=["Caregivers"])
def match_caregiver_profiles(request: CaregiverMatchRequest) -> CaregiverMatchResponse:
    try:
        result = match_caregivers(request)
        record_safety_event(
            event_type="caregiver_match",
            urgency_label=request.urgency_label.value,
            red_flag_ids=[],
            language=request.preferred_language or "en",
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.post("/api/v1/session/reset", tags=["Session"])
def reset_session() -> Dict[str, str]:
    clear_safety_logs()
    return {
        "status": "reset_successful",
        "message": "Ephemeral session memory and local safety logs have been cleared.",
    }


@app.get("/api/v1/demo/scenarios", tags=["Demo"])
def get_demo_scenarios() -> List[Dict[str, Any]]:
    json_path = os.path.join(os.path.dirname(__file__), "data", "synthetic_triage_tests.json")
    if os.path.exists(json_path):
        with open(json_path, mode="r", encoding="utf-8") as f:
            return json.load(f)
    return []


@app.get("/api/v1/safety/logs", tags=["Safety"])
def get_safety_audit_logs() -> List[Dict[str, Any]]:
    return get_safety_logs()
