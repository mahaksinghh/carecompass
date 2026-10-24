import React, { useState } from 'react';
import {
  UserCheck,
  MapPin,
  Clock,
  Globe,
  Award,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { CaregiverMatchResult, LanguageCode } from '../types';
import { translations } from '../i18n';

interface CaregiverCardProps {
  match: CaregiverMatchResult;
  currentLang: LanguageCode;
  onSelect?: (caregiverId: string) => void;
  isSelected?: boolean;
}

export const CaregiverCard: React.FC<CaregiverCardProps> = ({
  match,
  currentLang,
  onSelect,
  isSelected = false,
}) => {
  const { profile, score, match_explanation } = match;
  const [showExplanation, setShowExplanation] = useState(false);
  const t = translations[currentLang];

  const getAvailabilityBadge = (avail: string) => {
    switch (avail.toLowerCase()) {
      case 'immediate':
        return { text: 'Available Now', bg: 'bg-emerald-50 text-emerald-800 border-emerald-300' };
      case 'today':
        return { text: 'Available Today', bg: 'bg-teal-50 text-teal-800 border-teal-300' };
      case 'this_week':
        return { text: 'This Week', bg: 'bg-blue-50 text-blue-800 border-blue-300' };
      default:
        return { text: avail, bg: 'bg-slate-100 text-slate-700 border-slate-300' };
    }
  };

  const availBadge = getAvailabilityBadge(profile.availability);
  const scorePercent = Math.round(score * 100);

  return (
    <article
      className={`bg-white rounded-2xl border transition-all shadow-sm hover:shadow-md p-5 sm:p-6 ${
        isSelected ? 'border-teal-600 ring-2 ring-teal-100' : 'border-slate-200'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        {/* Left Profile Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-bold text-slate-900">{profile.display_name}</h3>
            {profile.verified_status && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-full">
                <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                Verified Non-Clinical Aide
              </span>
            )}
            <span className="text-[10px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
              Fictional Demo Profile
            </span>
          </div>

          <p className="text-sm font-semibold text-slate-600">{profile.role}</p>

          <p className="text-xs text-slate-500 italic max-w-lg">
            {profile.eligibility_notes}
          </p>

          {/* Key metadata chips */}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-600">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{profile.service_area}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${availBadge.bg}`}>
                {availBadge.text}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>{profile.languages.join(', ').toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Right Match Score */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
          <div className="text-center sm:text-right">
            <div className="inline-flex items-baseline gap-1">
              <span className="text-2xl font-black text-teal-700">{scorePercent}%</span>
              <span className="text-xs font-semibold text-slate-500">Fit Score</span>
            </div>
            <p className="text-[10px] text-slate-400">Deterministic Match</p>
          </div>

          {onSelect && (
            <button
              onClick={() => onSelect(profile.caregiver_id)}
              className={`px-4 py-2 text-xs font-bold rounded-lg border transition ${
                isSelected
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-300'
              }`}
            >
              {isSelected ? 'Selected' : 'Select Aide'}
            </button>
          )}
        </div>
      </div>

      {/* Skills tags */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
        {profile.skills.map((skill, idx) => (
          <span
            key={idx}
            className="text-[11px] px-2.5 py-1 bg-slate-50 text-slate-700 border border-slate-200 rounded-md font-medium"
          >
            {skill.replace(/_/g, ' ')}
          </span>
        ))}
      </div>

      {/* Transparent Match Reasons Dropdown */}
      <div className="mt-3">
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
          aria-expanded={showExplanation}
        >
          <span>Why this caregiver was matched</span>
          {showExplanation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showExplanation && (
          <div className="mt-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pb-2 border-b border-slate-200">
              <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-medium">Skill Fit (40%)</span>
                <span className="font-bold text-slate-800">{Math.round(match_explanation.skill_fit_score * 100)}%</span>
              </div>
              <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-medium">Availability (25%)</span>
                <span className="font-bold text-slate-800">{Math.round(match_explanation.availability_score * 100)}%</span>
              </div>
              <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-medium">Service Area (20%)</span>
                <span className="font-bold text-slate-800">{Math.round(match_explanation.area_score * 100)}%</span>
              </div>
              <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-medium">Language (15%)</span>
                <span className="font-bold text-slate-800">{Math.round(match_explanation.language_score * 100)}%</span>
              </div>
            </div>

            <ul className="space-y-1">
              {match_explanation.reasons.map((reason, i) => (
                <li key={i} className="flex items-center gap-1.5 text-slate-700">
                  <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
};
