import React from 'react';
import { AlertOctagon, PhoneCall, CheckCircle2, ShieldAlert, ArrowLeft } from 'lucide-react';
import { EmergencyInstructions, RedFlagTrigger, LanguageCode } from '../types';
import { translations } from '../i18n';

interface EmergencyAlertProps {
  instructions?: EmergencyInstructions | null;
  redFlags: RedFlagTrigger[];
  currentLang: LanguageCode;
  onReset: () => void;
}

export const EmergencyAlert: React.FC<EmergencyAlertProps> = ({
  instructions,
  redFlags,
  currentLang,
  onReset,
}) => {
  const t = translations[currentLang];
  const callNumber = instructions?.primary_call_number || '112';

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="bg-white rounded-2xl border-2 border-rose-600 shadow-xl overflow-hidden my-6 max-w-3xl mx-auto"
    >
      {/* Header Banner */}
      <div className="bg-rose-600 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
        <div className="w-16 h-16 rounded-full bg-rose-700/80 flex items-center justify-center shrink-0 border-2 border-rose-400">
          <AlertOctagon className="w-10 h-10 text-white animate-bounce" />
        </div>
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded text-xs font-bold uppercase bg-white/20 tracking-wider mb-1">
            Immediate Clinical Escalation
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            {t.emergencyTitle}
          </h2>
          <p className="text-rose-100 text-sm mt-1">
            Red flag indicators detected. CareCompass has stopped ordinary routing to protect your safety.
          </p>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* Direct Call to Action */}
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 text-center flex flex-col items-center">
          <p className="text-rose-950 font-bold text-base mb-1">
            In India, dial emergency dispatch:
          </p>
          <a
            href={`tel:${callNumber}`}
            className="inline-flex items-center gap-3 px-8 py-3.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-extrabold text-xl rounded-xl shadow-lg transition transform hover:scale-[1.02]"
            aria-label={`Dial ${callNumber} emergency services`}
          >
            <PhoneCall className="w-6 h-6 animate-pulse" />
            <span>Call {callNumber} Immediately</span>
          </a>
          <p className="text-xs text-rose-800 mt-3 max-w-lg">
            {instructions?.number_note ||
              'In India, call 112 for all emergencies. If outside India, dial your country’s local emergency number.'}
          </p>
        </div>

        {/* Immediate Safe Action Steps */}
        <div>
          <h3 className="font-bold text-slate-900 text-base mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-rose-600" />
            Immediate Safety Protocol:
          </h3>
          <ul className="space-y-2 text-sm text-slate-700 list-disc list-inside">
            {instructions?.immediate_actions.map((action, i) => (
              <li key={i} className="leading-relaxed font-medium">
                {action}
              </li>
            ))}
          </ul>
        </div>

        {/* Red Flags Triggered */}
        {redFlags.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h4 className="text-xs font-bold uppercase text-slate-600 tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Safety Rules Triggered (Deterministic Safety Engine):
            </h4>
            <div className="flex flex-wrap gap-2">
              {redFlags.map((flag) => (
                <span
                  key={flag.flag_id}
                  className="px-2.5 py-1 bg-rose-100 text-rose-900 rounded-md text-xs font-semibold border border-rose-200"
                >
                  {flag.description}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Explicit App Limitations Disclaimer */}
        <div className="border-t border-slate-200 pt-4 text-xs text-slate-500 leading-relaxed bg-amber-50/50 p-3 rounded-lg border border-amber-200/60">
          <strong>Important notice:</strong> CareCompass is an automated navigation prototype and{' '}
          <strong>CANNOT dispatch emergency ambulances or responders</strong>. Please make a direct telephone call to local emergency services or go to the nearest emergency room immediately.
        </div>

        {/* Back / Reset */}
        <div className="flex justify-start pt-2">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-sm font-medium transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.startOverBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
