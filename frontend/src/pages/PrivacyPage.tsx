import React from 'react';
import {
  ShieldCheck,
  Lock,
  AlertTriangle,
  Database,
  FileCheck,
  Cpu,
  RotateCcw,
} from 'lucide-react';
import { LanguageCode } from '../types';
import { translations } from '../i18n';

interface PrivacyPageProps {
  currentLang: LanguageCode;
  onResetSession: () => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ currentLang, onResetSession }) => {
  const t = translations[currentLang];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold mb-2">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>Patient Safety & Responsible AI Architecture</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Privacy, Clinical Safety & App Limitations
        </h1>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          CareCompass is engineered with conservative safety guardrails, deterministic triage rules, and strict privacy boundaries.
        </p>
      </div>

      {/* Grid of policies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Zero Persistent Health Storage</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            All user inputs, transcriptions, and follow-up responses exist only in transient browser memory during the active session. Nothing is committed to permanent databases or sold to third parties.
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Deterministic Safety Layer</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Emergency red-flag rules (e.g. stroke FAST, cardiac chest pain, respiratory distress) are evaluated deterministically in code. No generative AI model is permitted to override, bypass, or downgrade emergency triage urgency.
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Strict Non-Diagnostic Role</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            CareCompass explicitly does NOT predict disease names, calculate diagnostic probabilities, recommend pharmaceutical dosages, or modify existing treatment plans. It only provides operational navigation towards appropriate healthcare facilities.
          </p>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Synthetic Demonstration Data</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            All caregiver profiles, names, locations, and benchmark test scenarios are completely fictional synthetic data created for educational hackathon demonstration. No real personal identifiable information (PII) is included.
          </p>
        </div>
      </div>

      {/* Clear session box */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">{t.clearSessionTitle}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Instantly wipe all session state, entered concern text, and audit events from memory.
          </p>
        </div>

        <button
          onClick={onResetSession}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Clear My Session Memory Now</span>
        </button>
      </div>
    </div>
  );
};
