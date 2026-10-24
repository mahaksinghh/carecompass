import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "red_flag_engine" in data


def test_languages_endpoint():
    response = client.get("/api/v1/languages")
    assert response.status_code == 200
    langs = response.json()
    assert len(langs) >= 3
    codes = [l["code"] for l in langs]
    assert "en" in codes
    assert "hi" in codes
    assert "hinglish" in codes


def test_intake_parse_endpoint():
    payload = {
        "text": "Mild runny nose and sore throat for 2 days",
        "language": "en",
        "voice_used": False,
    }
    response = client.post("/api/v1/intake/parse", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "extracted_symptoms" in data
    assert "session_token" in data


def test_follow_up_endpoint():
    payload = {
        "extracted_symptoms": [{"concept": "high_fever", "raw_mention": "high fever", "negated": False, "confidence": 0.9}],
        "answered_questions": [],
        "language": "en",
    }
    response = client.post("/api/v1/intake/follow-up", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "questions" in data
    assert data["progress_percent"] > 0


def test_triage_evaluate_emergency():
    payload = {
        "text": "Crushing chest pain radiating to my left arm, cold sweats",
        "extracted_symptoms": [],
        "answers": [],
        "language": "en",
    }
    response = client.post("/api/v1/triage/evaluate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["urgency_label"] == "EMERGENCY"
    assert data["is_emergency"] is True
    assert data["caregiver_eligible"] is False
    assert data["emergency_instructions"]["primary_call_number"] == "112"


def test_caregiver_match_endpoint():
    payload = {
        "urgency_label": "NON_CLINICAL_SUPPORT",
        "is_emergency": False,
        "required_skills": ["elder_care"],
        "user_location": "South Delhi",
        "preferred_language": "en",
    }
    response = client.post("/api/v1/caregivers/match", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["total_found"] > 0
    assert len(data["matches"]) > 0


def test_session_reset_endpoint():
    response = client.post("/api/v1/session/reset")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "reset_successful"


def test_demo_scenarios_endpoint():
    response = client.get("/api/v1/demo/scenarios")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 12
