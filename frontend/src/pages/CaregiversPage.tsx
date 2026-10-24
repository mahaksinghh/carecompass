import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  ShieldAlert,
  AlertTriangle,
  Award,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import {
  CaregiverProfile,
  CaregiverMatchResult,
  LanguageCode,
  TriageEvaluateResponse,
} from '../types';
import { translations } from '../i18n';
import { CaregiverCard } from '../components/CaregiverCard';
import { matchCaregivers } from '../services/api';

interface CaregiversPageProps {
  currentLang: LanguageCode;
  triageResult: TriageEvaluateResponse | null;
  onSelectCaregiver: (profile: CaregiverProfile) => void;
  selectedCaregiverId?: string;
  onNavigateToSummary: () => void;
}

export const CaregiversPage: React.FC<CaregiversPageProps> = ({
  currentLang,
  triageResult,
  onSelectCaregiver,
  selectedCaregiverId,
  onNavigateToSummary,
}) => {
  const t = translations[currentLang];

  const isEmergency = triageResult?.is_emergency ?? false;
  const [matches, setMatches] = useState<CaregiverMatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState<string>('All');
  const [selectedSkill, setSelectedSkill] = useState<string>('All');

  const areas = ['All', 'South Delhi', 'North Delhi', 'Central Delhi', 'West Delhi', 'Noida', 'Gurgaon'];
  const skillOptions = [
    'All',
    'elder_care',
    'mobility_assistance',
    'medication_reminders',
    'wound_dressing_assistance',
    'post_op_care',
    'dementia_support',
    'companionship',
  ];

  const loadMatches = async () => {
    setLoading(true);
    const requiredSkills = selectedSkill !== 'All' ? [selectedSkill] : [];
    const location = selectedArea !== 'All' ? selectedArea : 'South Delhi';

    const res = await matchCaregivers(
      triageResult?.urgency_label || 'NON_CLINICAL_SUPPORT',
      isEmergency,
      requiredSkills,
      location,
      currentLang
    );

    setMatches(res.matches);
    setLoading(false);
  };

  useEffect(() => {
    loadMatches();
  }, [selectedArea, selectedSkill, isEmergency, currentLang]);

  // If in emergency state: enforce strict clinical bypass
  if (isEmergency) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-600 text-white flex items-center justify-center mx-auto shadow-md">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-rose-950">
            Caregiver Matching Disabled for Emergency
          </h2>
          <p className="text-sm text-rose-800 max-w-xl mx-auto font-medium leading-relaxed">
            {t.emergencyNoCaregiversNotice}
          </p>
          <div className="pt-2">
            <a
              href="tel:112"
              className="inline-flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-base rounded-xl shadow-md transition"
            >
              <span>{t.call112Btn}</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t.caregiversTitle}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
              Fictional Demo Profiles
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t.caregiversSubtitle}
          </p>
        </div>

        {selectedCaregiverId && (
          <button
            onClick={onNavigateToSummary}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md transition shrink-0"
          >
            <span>Proceed to Summary</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Region:</span>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-xs rounded-lg px-2 py-1.5 font-medium cursor-pointer"
            >
              {areas.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <span>Skill Focus:</span>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-xs rounded-lg px-2 py-1.5 font-medium cursor-pointer"
            >
              {skillOptions.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Deterministic Weights: Skill 40% • Avail 25% • Area 20% • Lang 15%
        </div>
      </div>

      {/* Caregiver list */}
      {loading ? (
        <div className="text-center py-12 space-y-3">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Matching verified profiles...</p>
        </div>
      ) : matches.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center space-y-3">
          <Users className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">{t.noCaregiversFound}</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your region filter or skill requirement. Fictional demo database contains 10 synthetic profiles.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((m) => (
            <CaregiverCard
              key={m.profile.caregiver_id}
              match={m}
              currentLang={currentLang}
              isSelected={selectedCaregiverId === m.profile.caregiver_id}
              onSelect={() => onSelectCaregiver(m.profile)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
