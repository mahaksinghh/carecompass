import React from 'react';
import {
  AlertTriangle,
  Clock,
  Calendar,
  Users,
  HelpCircle,
  CheckCircle,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { UrgencyLevel, LanguageCode } from '../types';
import { translations } from '../i18n';

interface CareRoutingCardProps {
  urgencyLabel: UrgencyLevel;
  careType: string;
  userExplanation: string;
  uncertaintyMessage?: string | null;
  nextSteps: string[];
  reasonCodes: string[];
  currentLang: LanguageCode;
  onProceedToCaregivers?: () => void;
  showCaregiverButton?: boolean;
}

export const CareRoutingCard: React.FC<CareRoutingCardProps> = ({
  urgencyLabel,
  careType,
  userExplanation,
  uncertaintyMessage,
  nextSteps,
  reasonCodes,
  currentLang,
  onProceedToCaregivers,
  showCaregiverButton = true,
}) => {
  const t = translations[currentLang];

  // Visual badge configuration (accessible with distinct icons & labels, never color alone)
  const getBadgeConfig = () => {
    switch (urgencyLabel) {
      case 'URGENT_IN_PERSON':
        return {
          icon: <Clock className="w-5 h-5 text-amber-700" />,
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-300',
          textColor: 'text-amber-900',
          tag: 'Urgent Medical Attention (Within 24 Hours)',
        };
      case 'ROUTINE_CLINICAL':
        return {
          icon: <Calendar className="w-5 h-5 text-blue-700" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-300',
          textColor: 'text-blue-900',
          tag: 'Routine Outpatient Appointment',
        };
      case 'NON_CLINICAL_SUPPORT':
        return {
          icon: <Users className="w-5 h-5 text-teal-700" />,
          bgColor: 'bg-teal-50',
          borderColor: 'border-teal-300',
          textColor: 'text-teal-900',
          tag: 'Non-Clinical Support & Caregiving',
        };
      case 'UNCERTAIN_ROUTINE':
      default:
        return {
          icon: <HelpCircle className="w-5 h-5 text-slate-700" />,
          bgColor: 'bg-slate-100',
          borderColor: 'border-slate-300',
          textColor: 'text-slate-900',
          tag: 'Inconclusive Pattern — Professional Exam Advised',
        };
    }
  };

  const badge = getBadgeConfig();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden my-6 max-w-3xl mx-auto">
      {/* Header Bar */}
      <div className={`p-6 border-b ${badge.bgColor} ${badge.borderColor} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white shadow-sm border border-slate-200">
            {badge.icon}
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
              Suggested Next Step
            </span>
            <h2 className={`text-xl sm:text-2xl font-black ${badge.textColor}`}>
              {careType}
            </h2>
          </div>
        </div>
        <span className={`hidden sm:inline-block px-3 py-1 rounded-full text-xs font-bold border ${badge.borderColor} ${badge.textColor} bg-white shadow-xs`}>
          {badge.tag}
        </span>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* Explanation */}
        <div>
          <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
            Clinical Navigation Summary
          </h3>
          <p className="text-slate-800 text-base leading-relaxed font-medium">
            {userExplanation}
          </p>
        </div>

        {/* Uncertainty notice */}
        {uncertaintyMessage && (
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                Transparency & Uncertainty Statement
              </h4>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                {uncertaintyMessage}
              </p>
            </div>
          </div>
        )}

        {/* Actionable Next Steps */}
        {nextSteps.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-3">
              Recommended Next Steps
            </h3>
            <ul className="space-y-2.5">
              {nextSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <CheckCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Transparent Reason Codes */}
        {reasonCodes.length > 0 && (
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Transparent Rule Codes:</span>
              <span className="font-mono text-slate-700">{reasonCodes.join(', ')}</span>
            </div>
            <span className="text-[11px] text-slate-400">Prototype Rules v1.0</span>
          </div>
        )}

        {/* Button to proceed to caregivers if applicable */}
        {showCaregiverButton && (
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={onProceedToCaregivers}
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-md transition"
            >
              <span>{t.findCareBtn}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
