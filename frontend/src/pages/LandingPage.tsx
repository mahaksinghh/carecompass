import React from 'react';
import {
  Compass,
  ShieldCheck,
  HeartHandshake,
  Users,
  ArrowRight,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  Clock,
  Lock,
} from 'lucide-react';
import { LanguageCode } from '../types';
import { translations } from '../i18n';

interface LandingPageProps {
  currentLang: LanguageCode;
  onStartGuidance: () => void;
  onFindCaregivers: () => void;
  onOpenDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  currentLang,
  onStartGuidance,
  onFindCaregivers,
  onOpenDemo,
}) => {
  const t = translations[currentLang];

  return (
    <div className="space-y-16 py-8 sm:py-12">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Multilingual Care Navigation Prototype</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight sm:leading-tight">
          {t.heroHeading}
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          {t.heroSubheading}
        </p>

        {/* Primary CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={onStartGuidance}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-extrabold text-base rounded-2xl shadow-lg transition transform hover:-translate-y-0.5"
          >
            <span>{t.getGuidanceBtn}</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={onFindCaregivers}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 hover:border-slate-300 font-bold text-base rounded-2xl shadow-sm transition"
          >
            <Users className="w-5 h-5 text-teal-600" />
            <span>{t.findCareBtn}</span>
          </button>
        </div>

        <div className="pt-2">
          <button
            onClick={onOpenDemo}
            className="text-xs font-semibold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100/80 px-3 py-1.5 rounded-lg border border-amber-200 transition"
          >
            Looking for evaluation? Launch Judge Demo & Benchmarks Panel →
          </button>
        </div>
      </section>

      {/* 3 Core Architecture Pillars */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pillar 1 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <Compass className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">1. Plain-Language Intake</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Express your feelings or questions naturally in English, हिन्दी, or Hinglish. Optional voice input with manual text alternative. No medical jargon required.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">2. Deterministic Safety Engine</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Before ordinary routing, strict safety rules evaluate red flags (stroke, cardiac chest pain, breathing difficulty). Emergency cases are directed to 112 immediately.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">3. Explainable Caregiver Fit</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Match with vetted non-clinical aides, companions, and home assistants based on skills (40%), availability (25%), location (20%), and language (15%).
            </p>
          </div>
        </div>
      </section>

      {/* Trust & Boundary Notice */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-teal-600" />
            Built With Core Healthcare Principles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span><strong>Zero Hallucinations:</strong> Safety red flags are deterministic code; AI is never allowed to downgrade urgency.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span><strong>No Clinical Claims:</strong> Does not diagnose, prescribe medications, or replace human doctors.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span><strong>Privacy Preserving:</strong> No health text stored to logs; temporary sessions cleared upon request.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span><strong>Emergency Isolation:</strong> Potential emergencies bypass caregiver matching entirely.</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
