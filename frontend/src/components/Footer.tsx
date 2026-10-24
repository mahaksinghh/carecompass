import React from 'react';
import { ShieldCheck, PhoneCall, AlertTriangle, Heart } from 'lucide-react';
import { LanguageCode } from '../types';
import { translations } from '../i18n';

interface FooterProps {
  currentLang: LanguageCode;
}

export const Footer: React.FC<FooterProps> = ({ currentLang }) => {
  const t = translations[currentLang];

  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto border-t border-slate-800">
      {/* Prominent Emergency Warning Bar */}
      <div className="bg-rose-950/80 border-b border-rose-900/60 py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 text-rose-200 text-sm font-medium">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" aria-hidden="true" />
            <span>Emergency in India? Dial <strong className="text-white underline">112</strong> immediately. If abroad, dial your local emergency line.</span>
          </div>
          <a
            href="tel:112"
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-md text-xs font-semibold shadow-sm transition"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            Call 112
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Col 1: Mission */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-bold text-white text-lg">CareCompass</span>
              <span className="text-xs px-2 py-0.5 rounded bg-teal-900 text-teal-300 border border-teal-700">Prototype</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              CareCompass empowers individuals to articulate health concerns in plain language and discover safe, non-diagnostic next steps and verified local caregivers.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>WCAG 2.1 AA Compliant & Privacy-Preserving</span>
            </div>
          </div>

          {/* Col 2: Mandatory Disclaimer */}
          <div className="md:col-span-2 bg-slate-800/60 p-4 rounded-xl border border-slate-700">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Mandatory Safety & Non-Diagnostic Disclaimer
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t.disclaimerFull}
            </p>
            <p className="text-[11px] text-slate-400 mt-2">
              Caregivers presented are fictional demonstrative profiles for non-clinical home support and companionship. Caregivers are not licensed medical practitioners unless explicitly documented.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© 2026 CareCompass Hackathon Architecture. Released under MIT License for research & education.</p>
          <div className="flex items-center gap-4">
            <span>Deterministic Red-Flag Layer</span>
            <span>•</span>
            <span>Zero Unverified AI Overrides</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
