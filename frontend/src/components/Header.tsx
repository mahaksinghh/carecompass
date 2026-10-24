import React from 'react';
import { Compass, Globe, ShieldAlert, Award, RefreshCw } from 'lucide-react';
import { LanguageCode } from '../types';
import { translations } from '../i18n';

interface HeaderProps {
  currentLang: LanguageCode;
  onSelectLang: (lang: LanguageCode) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onResetSession: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onSelectLang,
  activeTab,
  onSelectTab,
  onResetSession,
}) => {
  const t = translations[currentLang];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => onSelectTab('home')}
            role="button"
            tabIndex={0}
            aria-label="CareCompass Home"
            onKeyDown={(e) => e.key === 'Enter' && onSelectTab('home')}
          >
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-xl text-slate-900 tracking-tight">CareCompass</span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-xs font-medium bg-teal-50 text-teal-800 rounded-full border border-teal-200">
                Prototype v1.0
              </span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
            <button
              onClick={() => onSelectTab('home')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === 'home' || activeTab === 'intake'
                  ? 'bg-teal-50 text-teal-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Care Guidance
            </button>
            <button
              onClick={() => onSelectTab('caregivers')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === 'caregivers'
                  ? 'bg-teal-50 text-teal-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Caregiver Support
            </button>
            <button
              onClick={() => onSelectTab('demo')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === 'demo'
                  ? 'bg-amber-100 text-amber-900 font-semibold'
                  : 'text-amber-800 hover:bg-amber-50'
              }`}
            >
              <Award className="w-4 h-4 text-amber-600" />
              Demo & Benchmarks
            </button>
            <button
              onClick={() => onSelectTab('privacy')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === 'privacy'
                  ? 'bg-teal-50 text-teal-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Privacy & Safety
            </button>
          </nav>

          {/* Right actions: Language selector & Reset button */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center">
              <Globe className="w-4 h-4 text-slate-500 mr-1.5" aria-hidden="true" />
              <label htmlFor="language-select" className="sr-only">
                Select language
              </label>
              <select
                id="language-select"
                value={currentLang}
                onChange={(e) => onSelectLang(e.target.value as LanguageCode)}
                className="bg-slate-50 border border-slate-300 text-slate-800 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 p-1.5 font-medium cursor-pointer"
                aria-label="Interface Language"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="hinglish">Hinglish</option>
              </select>
            </div>

            <button
              onClick={onResetSession}
              title={t.clearSessionTitle}
              className="flex items-center gap-1 text-xs text-slate-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1.5 rounded-md border border-slate-200 transition"
              aria-label="Reset session memory"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
