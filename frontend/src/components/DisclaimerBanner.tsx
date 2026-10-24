import React from 'react';
import { Shield, Info } from 'lucide-react';
import { LanguageCode } from '../types';
import { translations } from '../i18n';

interface DisclaimerBannerProps {
  currentLang: LanguageCode;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ currentLang }) => {
  const t = translations[currentLang];

  return (
    <aside
      className="bg-teal-50 border-y border-teal-200/80 px-4 py-2.5 sm:px-6"
      aria-label="Safety notification"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm text-teal-900">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-teal-700 shrink-0" aria-hidden="true" />
          <span>
            <strong>Safety Protocol:</strong> {t.disclaimerShort}
          </span>
        </div>
        <div className="hidden md:flex items-center gap-1.5 text-xs text-teal-700 font-medium">
          <Info className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Deterministic safety rules verify every query first</span>
        </div>
      </div>
    </aside>
  );
};
