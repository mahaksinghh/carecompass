import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Check,
  Download,
  RotateCcw,
  Edit3,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Users,
} from 'lucide-react';
import {
  TriageEvaluateResponse,
  CaregiverProfile,
  FollowUpAnswer,
  LanguageCode,
} from '../types';
import { translations } from '../i18n';

interface SummaryViewProps {
  userConcern: string;
  triageResult: TriageEvaluateResponse | null;
  selectedCaregiver?: CaregiverProfile | null;
  answers: FollowUpAnswer[];
  currentLang: LanguageCode;
  onEdit: () => void;
  onReset: () => void;
}

export const SummaryView: React.FC<SummaryViewProps> = ({
  userConcern,
  triageResult,
  selectedCaregiver,
  answers,
  currentLang,
  onEdit,
  onReset,
}) => {
  const t = translations[currentLang];
  const [copied, setCopied] = useState(false);

  const generateReportText = (): string => {
    const timestamp = new Date().toLocaleString();
    return `CARECOMPASS SESSION REPORT
Generated: ${timestamp}
Language: ${currentLang.toUpperCase()}

[PATIENT CONCERN]
${userConcern}

[FOLLOW-UP ANSWERS]
${answers.length > 0 ? answers.map((a) => `- ${a.question_id}: ${a.answer}`).join('\n') : 'None'}

[CARE ROUTING GUIDANCE]
Urgency: ${triageResult?.urgency_label || 'N/A'}
Care Type: ${triageResult?.care_type || 'N/A'}
Explanation: ${triageResult?.user_explanation || 'N/A'}
Reason Codes: ${triageResult?.reason_codes.join(', ') || 'N/A'}

[NEXT STEPS]
${triageResult?.next_steps.map((s) => `• ${s}`).join('\n') || 'N/A'}

[SELECTED CAREGIVER / COMPANION]
${
  selectedCaregiver
    ? `${selectedCaregiver.display_name} (${selectedCaregiver.role})\nArea: ${selectedCaregiver.service_area}\nSkills: ${selectedCaregiver.skills.join(', ')}`
    : 'None selected'
}

DISCLAIMER:
CareCompass is a navigation prototype, not a medical diagnosis or prescribing tool. If experiencing an emergency, dial 112 (India) or local emergency services immediately.
`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateReportText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([generateReportText()], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `CareCompass_Guidance_${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 max-w-3xl mx-auto my-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-700">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">{t.summaryTitle}</h2>
            <p className="text-xs text-slate-500">Review your care navigation summary before saving or sharing</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? t.copiedMsg : t.copyBtn}</span>
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5 text-teal-600" />
            <span>{t.downloadBtn}</span>
          </button>
        </div>
      </div>

      {/* Concern card */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
            Your Health Concern
          </h3>
          <button
            onClick={onEdit}
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{t.editBtn}</span>
          </button>
        </div>
        <p className="text-sm text-slate-800 italic font-medium">"{userConcern}"</p>
      </div>

      {/* Triage Guidance Summary */}
      {triageResult && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
            Care Guidance Direction
          </h3>
          <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/60 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-sm text-teal-950 block">
                {triageResult.care_type} ({triageResult.urgency_label})
              </span>
              <p className="text-xs text-teal-900 leading-relaxed font-medium">
                {triageResult.user_explanation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Selected Caregiver Profile */}
      {selectedCaregiver && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
            Selected Non-Clinical Support Aide
          </h3>
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <p className="font-bold text-sm text-slate-900">{selectedCaregiver.display_name}</p>
              <p className="text-xs text-slate-600">{selectedCaregiver.role} • {selectedCaregiver.service_area}</p>
            </div>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-teal-100 text-teal-800">
              Matched
            </span>
          </div>
        </div>
      )}

      {/* Bottom controls */}
      <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 text-xs font-semibold text-rose-700 hover:text-rose-800 px-3 py-2 rounded-lg border border-rose-200 bg-rose-50/50 hover:bg-rose-100/50 transition w-full sm:w-auto justify-center"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t.resetBtn}</span>
        </button>

        <p className="text-[11px] text-slate-400 text-center sm:text-right">
          Session data is held in browser memory only and cleared automatically upon reset.
        </p>
      </div>
    </div>
  );
};
