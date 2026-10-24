import {
  LanguageCode,
  ExtractedSymptom,
  FollowUpQuestion,
  FollowUpAnswer,
  TriageEvaluateResponse,
  CaregiverMatchResponse,
  DemoScenario,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export async function parseConcern(
  text: string,
  language: LanguageCode,
  voiceUsed: boolean = false
): Promise<{ extracted_symptoms: ExtractedSymptom[]; uncertainty_detected: boolean; session_token: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/intake/parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language, voice_used: voiceUsed }),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, using client-side fallback parsing:', err);
    // Client-side fallback
    return {
      extracted_symptoms: [{ concept: 'health_concern', raw_mention: text.slice(0, 50), negated: false, confidence: 0.85 }],
      uncertainty_detected: text.length < 15,
      session_token: 'offline_session',
    };
  }
}

export async function fetchFollowUpQuestions(
  extractedSymptoms: ExtractedSymptom[],
  answeredQuestions: FollowUpAnswer[],
  language: LanguageCode
): Promise<{ questions: FollowUpQuestion[]; progress_percent: number }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/intake/follow-up`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        extracted_symptoms: extractedSymptoms,
        answered_questions: answeredQuestions,
        language,
      }),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, using default question fallback:', err);
    return {
      questions: [
        {
          id: 'duration_progression',
          text: 'How quickly did these symptoms develop, and are they getting rapidly worse?',
          type: 'choice',
          options: ['Gradually over days', 'Suddenly within hours', 'Rapidly worsening right now', "I'm not sure", 'Prefer not to say'],
          why_asked: 'Onset and progression speed help identify whether urgent medical attention is required.',
        },
      ],
      progress_percent: 60,
    };
  }
}

export async function evaluateTriage(
  text: string,
  extractedSymptoms: ExtractedSymptom[],
  answers: FollowUpAnswer[],
  language: LanguageCode
): Promise<TriageEvaluateResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/triage/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        extracted_symptoms: extractedSymptoms,
        answers,
        language,
      }),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, using client-side fallback triage:', err);
    const isEmerg = /chest pain|cannot breathe|slurred speech|stroke|unresponsive|zehar|behosh/i.test(text);
    return {
      status: isEmerg ? 'emergency_divert' : 'evaluated_routine',
      urgency_label: isEmerg ? 'EMERGENCY' : 'ROUTINE_CLINICAL',
      care_type: isEmerg ? 'Emergency care now' : 'Routine clinician appointment',
      is_emergency: isEmerg,
      emergency_instructions: isEmerg
        ? {
            primary_call_number: '112',
            number_note: 'In India, call 112 for emergency dispatch. Outside India, dial your local emergency service.',
            immediate_actions: [
              'Call 112 immediately.',
              'Keep the person calm and seated or lying on their side.',
              'Do not give unprescribed medications or food.',
            ],
            disclaimer: 'CareCompass cannot dispatch emergency units directly.',
          }
        : null,
      red_flags_triggered: isEmerg
        ? [{ flag_id: 'FALLBACK_EMERGENCY', category: 'emergency', description: 'Urgent emergency symptoms detected', matched_cues: ['critical cue'] }]
        : [],
      reason_codes: isEmerg ? ['FALLBACK_EMERGENCY'] : ['ROUTINE_FALLBACK'],
      user_explanation: isEmerg
        ? 'Warning: Emergency symptoms detected. Please contact local emergency services immediately.'
        : 'Based on your entered symptoms, an ordinary medical appointment or health consultation is advised.',
      uncertainty_message: 'Executed in client fallback mode.',
      next_steps: isEmerg
        ? ['Dial 112 immediately.', 'Do not wait for appointment.']
        : ['Schedule an appointment with a primary care clinic.', 'Observe for changes.'],
      caregiver_eligible: !isEmerg,
      model_version: 'fallback-v1.0',
      disclaimer: 'CareCompass is a prototype for care navigation, not a medical diagnosis.',
    };
  }
}

export async function matchCaregivers(
  urgencyLabel: string,
  isEmergency: boolean,
  requiredSkills: string[],
  userLocation: string,
  preferredLanguage: string
): Promise<CaregiverMatchResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/caregivers/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        urgency_label: urgencyLabel,
        is_emergency: isEmergency,
        required_skills: requiredSkills,
        user_location: userLocation,
        preferred_language: preferredLanguage,
      }),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, using fallback caregiver matches:', err);
    if (isEmergency || urgencyLabel === 'EMERGENCY') {
      return {
        status: 'emergency_bypassed',
        matches: [],
        total_found: 0,
        no_match_reason: 'Caregiver matching is strictly disabled for emergency cases.',
        weights_info: 'Demo weights: Skill 40%, Availability 25%, Area 20%, Language 15%',
        disclaimer: 'Caregivers are non-clinical support personnel.',
      };
    }
    return {
      status: 'matched',
      matches: [
        {
          profile: {
            caregiver_id: 'CG-101',
            display_name: 'Aarav Sharma',
            role: 'Certified Home Health Aide',
            skills: ['elder_care', 'mobility_assistance', 'medication_reminders'],
            languages: ['en', 'hi', 'hinglish'],
            service_area: 'South Delhi',
            availability: 'immediate',
            verified_status: true,
            eligibility_notes: 'Non-clinical certified caregiver with 6 years experience',
            demo_only: true,
          },
          score: 0.92,
          match_explanation: {
            skill_fit_score: 1.0,
            availability_score: 1.0,
            area_score: 0.8,
            language_score: 1.0,
            overall_score: 0.92,
            reasons: ['Skills matched: elder care, mobility', 'Available immediately', 'Speaks preferred language'],
          },
        },
      ],
      total_found: 1,
      weights_info: 'Demo weights: Skill 40%, Availability 25%, Area 20%, Language 15%',
      disclaimer: 'Caregivers are non-clinical support personnel.',
    };
  }
}

export async function resetSession(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/api/v1/session/reset`, { method: 'POST' });
  } catch (err) {
    console.warn('Reset local session:', err);
  }
}

export async function fetchDemoScenarios(): Promise<DemoScenario[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/demo/scenarios`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Using local fallback demo scenarios:', err);
    return [
      {
        id: 'DEMO-01',
        category: 'chest_pain_cardiac',
        language: 'en',
        input_text: 'Crushing chest pain radiating down left arm, feeling dizzy with cold sweats.',
        expected_urgency: 'EMERGENCY',
        expected_red_flag: 'CHEST_PAIN_CARDIAC',
        expected_caregiver_eligible: false,
        description: 'Classic cardiac emergency scenario',
      },
      {
        id: 'DEMO-02',
        category: 'routine_clinical',
        language: 'en',
        input_text: 'Mild runny nose, sneezing, and light sore throat since yesterday. No fever.',
        expected_urgency: 'ROUTINE_CLINICAL',
        expected_red_flag: null,
        expected_caregiver_eligible: true,
        description: 'Mild upper respiratory / cold',
      },
    ];
  }
}
