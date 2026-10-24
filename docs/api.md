# CareCompass API Reference

The CareCompass backend is built with FastAPI and OpenAPI 3.0 standards.
Interactive Swagger documentation is available locally at: `http://127.0.0.1:8000/docs`.

---

## Base URL
`http://127.0.0.1:8000`

---

## 1. System Health
### `GET /health`
Returns runtime status and active safety rules engine version.

**Response:**
```json
{
  "status": "healthy",
  "service": "CareCompass API",
  "version": "1.0.0",
  "red_flag_engine": "deterministic-v1.0"
}
```

---

## 2. Languages
### `GET /api/v1/languages`
Returns available interface and normalization languages.

**Response:**
```json
[
  {"code": "en", "name": "English", "native": "English", "direction": "ltr"},
  {"code": "hi", "name": "Hindi", "native": "हिन्दी", "direction": "ltr"},
  {"code": "hinglish", "name": "Hinglish", "native": "Hinglish", "direction": "ltr"}
]
```

---

## 3. Intake Concept Parsing
### `POST /api/v1/intake/parse`
Extracts structured symptom mentions, duration, severity, and negation from raw text.

**Request:**
```json
{
  "text": "Mild runny nose and sore throat for 2 days",
  "language": "en",
  "voice_used": false
}
```

**Response:**
```json
{
  "extracted_symptoms": [
    {
      "concept": "sore_throat",
      "raw_mention": "sore throat",
      "severity": "mild",
      "duration": "2 days",
      "negated": false,
      "confidence": 0.92
    }
  ],
  "uncertainty_detected": false,
  "clarification_needed": false,
  "session_token": "sess_81cf9d04ba71"
}
```

---

## 4. Follow-Up Question Selector
### `POST /api/v1/intake/follow-up`
Returns a maximum of 1–2 targeted clarifying questions with transparency rationale.

**Request:**
```json
{
  "extracted_symptoms": [
    {
      "concept": "high_fever",
      "raw_mention": "high fever",
      "negated": false,
      "confidence": 0.92
    }
  ],
  "answered_questions": [],
  "language": "en"
}
```

**Response:**
```json
{
  "questions": [
    {
      "id": "fever_cough",
      "text": "Are you experiencing any shortness of breath, chest tightness, or confusion?",
      "type": "choice",
      "options": [
        "No, breathing normally",
        "Yes, slight tightness",
        "Yes, severe trouble breathing",
        "I'm not sure",
        "Prefer not to say"
      ],
      "why_asked": "To verify that your fever and cough are not causing dangerously low oxygen levels or respiratory distress."
    }
  ],
  "progress_percent": 50,
  "can_proceed": true
}
```

---

## 5. Triage Evaluation
### `POST /api/v1/triage/evaluate`
Executes deterministic red-flag safety rules, computes provisional care-routing category, and returns transparent reason codes.

**Request:**
```json
{
  "text": "I feel a crushing pressure in the center of my chest radiating to my left arm",
  "extracted_symptoms": [],
  "answers": [],
  "language": "en"
}
```

**Response (Emergency State):**
```json
{
  "status": "emergency_divert",
  "urgency_label": "EMERGENCY",
  "care_type": "Emergency care now",
  "is_emergency": true,
  "emergency_instructions": {
    "primary_call_number": "112",
    "number_note": "In India, call 112 for all emergencies. If outside India, immediately dial your local emergency service.",
    "immediate_actions": [
      "Dial 112 (India) or your local emergency response service immediately.",
      "Do not wait for an online consultation or routine appointment.",
      "Keep the person in a safe position (seated comfortably).",
      "Do not give food, water, or oral medication."
    ],
    "disclaimer": "CareCompass is an automated care-navigation prototype and CANNOT dispatch emergency services."
  },
  "red_flags_triggered": [
    {
      "flag_id": "CHEST_PAIN_CARDIAC",
      "category": "chest_pain_cardiac",
      "description": "Suspected acute coronary syndrome / cardiac chest pain",
      "matched_cues": ["crushing pressure in the center of my chest radiating to my left arm"]
    }
  ],
  "reason_codes": ["CHEST_PAIN_CARDIAC"],
  "user_explanation": "Warning: Based on your description, you reported indicators that require immediate medical attention. CareCompass has stopped ordinary routing and recommends calling emergency services directly.",
  "uncertainty_message": null,
  "next_steps": [
    "Call 112 (India) or your national emergency number immediately.",
    "Stay with the person in a calm, safe environment."
  ],
  "caregiver_eligible": false,
  "model_version": "carecompass-rules-v1.0-deterministic",
  "disclaimer": "CareCompass is a prototype for care navigation, not a medical diagnosis."
}
```

---

## 6. Caregiver Matching
### `POST /api/v1/caregivers/match`
Ranks eligible fictional caregiver profiles using deterministic scoring (Skill 40%, Availability 25%, Area 20%, Language 15%). Emergency requests are strictly rejected.

**Request:**
```json
{
  "urgency_label": "NON_CLINICAL_SUPPORT",
  "is_emergency": false,
  "required_skills": ["elder_care", "medication_reminders"],
  "user_location": "South Delhi",
  "preferred_language": "en"
}
```

**Response:**
```json
{
  "status": "matched",
  "matches": [
    {
      "profile": {
        "caregiver_id": "CG-101",
        "display_name": "Aarav Sharma",
        "role": "Certified Home Health Aide",
        "skills": ["elder_care", "mobility_assistance", "vital_signs_monitoring", "medication_reminders"],
        "languages": ["en", "hi", "hinglish"],
        "service_area": "South Delhi",
        "availability": "immediate",
        "verified_status": true,
        "eligibility_notes": "Non-clinical certified caregiver with 6 years experience",
        "demo_only": true
      },
      "score": 0.94,
      "match_explanation": {
        "skill_fit_score: 1.0,
        "availability_score": 1.0,
        "area_score": 1.0,
        "language_score": 1.0,
        "overall_score": 0.94,
        "reasons": [
          "Skills matched: elder care, medication reminders",
          "Available immediately for urgent support",
          "Located in your primary service zone (South Delhi)",
          "Speaks your preferred language (en)"
        ]
      }
    }
  ],
  "total_found": 1,
  "weights_info": "Demo weights: Skill fit 40%, Availability 25%, Service area 20%, Language 15%.",
  "disclaimer": "Caregivers listed are fictional prototype profiles for non-clinical or post-diagnostic support."
}
```

---

## 7. Session Reset
### `POST /api/v1/session/reset`
Purges ephemeral memory and clears safety audit events.

**Response:**
```json
{
  "status": "reset_successful",
  "message": "Ephemeral session memory and local safety logs have been cleared."
}
```
