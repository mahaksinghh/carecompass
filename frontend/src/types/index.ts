export type LanguageCode = 'en' | 'hi' | 'hinglish';

export type UrgencyLevel =
  | 'EMERGENCY'
  | 'URGENT_IN_PERSON'
  | 'ROUTINE_CLINICAL'
  | 'NON_CLINICAL_SUPPORT'
  | 'UNCERTAIN_ROUTINE';

export interface ExtractedSymptom {
  concept: string;
  raw_mention: string;
  severity?: string | null;
  duration?: string | null;
  negated: boolean;
  confidence: number;
}

export interface FollowUpQuestion {
  id: string;
  text: string;
  type: string;
  options: string[];
  why_asked: string;
}

export interface FollowUpAnswer {
  question_id: string;
  answer: string;
}

export interface RedFlagTrigger {
  flag_id: string;
  category: string;
  description: string;
  matched_cues: string[];
}

export interface EmergencyInstructions {
  primary_call_number: string;
  number_note: string;
  immediate_actions: string[];
  disclaimer: string;
}

export interface TriageEvaluateResponse {
  status: string;
  urgency_label: UrgencyLevel;
  care_type: string;
  is_emergency: boolean;
  emergency_instructions?: EmergencyInstructions | null;
  red_flags_triggered: RedFlagTrigger[];
  reason_codes: string[];
  user_explanation: string;
  uncertainty_message?: string | null;
  next_steps: string[];
  caregiver_eligible: boolean;
  model_version: string;
  disclaimer: string;
}

export interface CaregiverProfile {
  caregiver_id: string;
  display_name: string;
  role: string;
  skills: string[];
  languages: string[];
  service_area: string;
  availability: string;
  verified_status: boolean;
  eligibility_notes: string;
  demo_only: boolean;
}

export interface MatchExplanation {
  skill_fit_score: number;
  availability_score: number;
  area_score: number;
  language_score: number;
  overall_score: number;
  reasons: string[];
}

export interface CaregiverMatchResult {
  profile: CaregiverProfile;
  score: number;
  match_explanation: MatchExplanation;
}

export interface CaregiverMatchResponse {
  status: string;
  matches: CaregiverMatchResult[];
  total_found: number;
  no_match_reason?: string | null;
  weights_info: string;
  disclaimer: string;
}

export interface DemoScenario {
  id: string;
  category: string;
  language: string;
  input_text: string;
  expected_urgency: string;
  expected_red_flag?: string | null;
  expected_caregiver_eligible: boolean;
  description: string;
}
