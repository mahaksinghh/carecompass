import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  HelpCircle,
  AlertCircle,
  Activity,
  CheckCircle,
} from 'lucide-react';
import {
  LanguageCode,
  ExtractedSymptom,
  FollowUpQuestion,
  FollowUpAnswer,
  TriageEvaluateResponse,
} from '../types';
import { translations } from '../i18n';
import { StepIndicator } from '../components/StepIndicator';
import { VoiceInput } from '../components/VoiceInput';
import { EmergencyAlert } from '../components/EmergencyAlert';
import { CareRoutingCard } from '../components/CareRoutingCard';
import { parseConcern, fetchFollowUpQuestions, evaluateTriage } from '../services/api';

interface IntakeFlowProps {
  currentLang: LanguageCode;
  onNavigateToCaregivers: (triage: TriageEvaluateResponse) => void;
  onResetSession: () => void;
  initialText?: string;
}

export const IntakeFlow: React.FC<IntakeFlowProps> = ({
  currentLang,
  onNavigateToCaregivers,
  onResetSession,
  initialText = '',
}) => {
  const t = translations[currentLang];

  const [step, setStep] = useState<number>(1); // 1: Concern, 2: Follow-up, 3: Guidance result
  const [concernText, setConcernText] = useState<string>(initialText);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Intake State
  const [extractedSymptoms, setExtractedSymptoms] = useState<ExtractedSymptom[]>([]);
  const [followUpQuestions, setFollowUpQuestions] = useState<FollowUpQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [triageResult, setTriageResult] = useState<TriageEvaluateResponse | null>(null);

  // Quick preset pills
  const presetPills = [
    { label: 'Mild fever & sore throat', text: 'I have had a mild fever and sore throat for 2 days.' },
    { label: 'Elderly care & companion', text: 'Looking for a verified home caregiver to assist my elderly mother with mobility and daily medicines.' },
    { label: 'Sprained ankle (no chest pain)', text: 'I sprained my ankle playing football. I have NO chest pain and NO breathing trouble.' },
    { label: 'Hinglish: Dadi ke liye caregiver', text: 'Dadi ke liye caregiver chahiye jo chalne aur dawa lene me help kare.' },
  ];

  // Submit initial concern
  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concernText.trim()) {
      setErrorMsg('Please describe your concern or question before continuing.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. First parse symptoms
      const parseRes = await parseConcern(concernText, currentLang);
      setExtractedSymptoms(parseRes.extracted_symptoms);

      // 2. Immediate red-flag pre-check: evaluate triage to detect if immediate emergency
      const triagePreCheck = await evaluateTriage(concernText, parseRes.extracted_symptoms, [], currentLang);

      if (triagePreCheck.is_emergency) {
        // Red flag detected! Immediately show emergency without delaying for questions!
        setTriageResult(triagePreCheck);
        setStep(3);
        setLoading(false);
        return;
      }

      // 3. If no emergency, fetch minimal follow-up questions
      const questionsRes = await fetchFollowUpQuestions(parseRes.extracted_symptoms, [], currentLang);
      if (questionsRes.questions.length > 0) {
        setFollowUpQuestions(questionsRes.questions);
        setStep(2);
      } else {
        // No follow-up questions needed, jump straight to triage result
        setTriageResult(triagePreCheck);
        setStep(3);
      }
    } catch (err: any) {
      console.error('Error during intake submission:', err);
      setErrorMsg('An error occurred while evaluating your concern. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Submit follow-up answers
  const handleFollowUpSubmit = async () => {
    setLoading(true);
    setErrorMsg(null);

    const formattedAnswers: FollowUpAnswer[] = Object.entries(answers).map(([qid, ans]) => ({
      question_id: qid,
      answer: ans,
    }));

    try {
      const triage = await evaluateTriage(concernText, extractedSymptoms, formattedAnswers, currentLang);
      setTriageResult(triage);
      setStep(3);
    } catch (err: any) {
      console.error('Error evaluating triage:', err);
      setErrorMsg('Failed to process follow-up responses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: string, option: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handleReset = () => {
    setStep(1);
    setConcernText('');
    setExtractedSymptoms([]);
    setFollowUpQuestions([]);
    setAnswers({});
    setTriageResult(null);
    setErrorMsg(null);
    onResetSession();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <StepIndicator currentStep={step} />

      {errorMsg && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STEP 1: Main Concern Intake */}
      {step === 1 && (
        <section aria-labelledby="intake-heading" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <h2 id="intake-heading" className="text-2xl font-black text-slate-900 tracking-tight">
              {t.intakeHeading}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {t.intakeHelpText}
            </p>
          </div>

          <form onSubmit={handleInitialSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="concern-input" className="sr-only">
                Health concern description
              </label>
              <textarea
                id="concern-input"
                rows={4}
                value={concernText}
                onChange={(e) => setConcernText(e.target.value)}
                placeholder={t.intakePlaceholder}
                className="w-full p-4 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 text-slate-900 text-sm leading-relaxed placeholder-slate-400 font-medium resize-y"
                required
              />
            </div>

            {/* Optional Voice Input */}
            <VoiceInput
              currentLang={currentLang}
              onTranscription={(transcribed) =>
                setConcernText((prev) => (prev ? `${prev} ${transcribed}` : transcribed))
              }
            />

            {/* Quick example pills */}
            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase text-slate-400 block mb-2">
                Or try a test scenario:
              </span>
              <div className="flex flex-wrap gap-2">
                {presetPills.map((pill, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setConcernText(pill.text)}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-teal-50 hover:border-teal-300 text-slate-700 transition"
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Next button */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
              <span className="text-[11px] text-slate-400">
                Safe, privacy-preserving session
              </span>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-md transition"
              >
                {loading ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    <span>Evaluating Safety...</span>
                  </>
                ) : (
                  <>
                    <span>{t.nextBtn}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* STEP 2: Minimal Follow-Up Questions */}
      {step === 2 && (
        <section aria-labelledby="followup-heading" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-[11px] font-bold uppercase text-teal-700 tracking-wider">
                Step 2 of 3 • Quick Follow-Up
              </span>
              <h2 id="followup-heading" className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                A few quick clarifying questions
              </h2>
            </div>

            <button
              onClick={() => setStep(1)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t.editBtn}</span>
            </button>
          </div>

          <div className="space-y-6">
            {followUpQuestions.map((q, idx) => (
              <fieldset key={q.id} className="space-y-3 p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                <legend className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-xs font-extrabold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span>{q.text}</span>
                </legend>

                {/* Trust cue: Why asked */}
                <div className="text-[11px] text-slate-500 italic bg-white p-2.5 rounded-lg border border-slate-100 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span><strong>{t.whyAskedTitle}</strong> {q.why_asked}</span>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = answers[q.id] === opt;
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleAnswerSelect(q.id, opt)}
                        className={`text-left text-xs p-3 rounded-lg border transition font-medium flex items-center justify-between ${
                          isSelected
                            ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                            : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        <span>{opt}</span>
                        {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-bold transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t.backBtn}</span>
            </button>

            <button
              type="button"
              onClick={handleFollowUpSubmit}
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-md transition"
            >
              {loading ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Guidance...</span>
                </>
              ) : (
                <>
                  <span>View Care Guidance</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </section>
      )}

      {/* STEP 3: Triage Result & Guidance */}
      {step === 3 && triageResult && (
        <section aria-labelledby="result-heading" className="space-y-6">
          {triageResult.is_emergency ? (
            <EmergencyAlert
              instructions={triageResult.emergency_instructions}
              redFlags={triageResult.red_flags_triggered}
              currentLang={currentLang}
              onReset={handleReset}
            />
          ) : (
            <CareRoutingCard
              urgencyLabel={triageResult.urgency_label}
              careType={triageResult.care_type}
              userExplanation={triageResult.user_explanation}
              uncertaintyMessage={triageResult.uncertainty_message}
              nextSteps={triageResult.next_steps}
              reasonCodes={triageResult.reason_codes}
              currentLang={currentLang}
              onProceedToCaregivers={() => onNavigateToCaregivers(triageResult)}
              showCaregiverButton={triageResult.caregiver_eligible}
            />
          )}

          {/* Back/edit or start over buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-300 rounded-lg transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t.editBtn}</span>
            </button>

            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.resetBtn}</span>
            </button>
          </div>
        </section>
      )}
    </div>
  );
};
