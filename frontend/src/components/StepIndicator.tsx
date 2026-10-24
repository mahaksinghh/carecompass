import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number; // 1: Intake, 2: Follow-up, 3: Care Guidance, 4: Caregiver Matches
  totalSteps?: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps = 4 }) => {
  const steps = [
    { num: 1, label: 'Your Concern' },
    { num: 2, label: 'Follow-Up' },
    { num: 3, label: 'Care Guidance' },
    { num: 4, label: 'Caregiver Support' },
  ];

  return (
    <nav aria-label="Intake Progress" className="w-full max-w-3xl mx-auto my-6 px-4">
      <ol className="flex items-center justify-between relative">
        {/* Background connecting bar */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 z-0" />
        <div
          className="absolute top-1/2 left-0 h-1 bg-teal-600 -translate-y-1/2 z-0 transition-all duration-300"
          style={{ width: `${((Math.min(currentStep, totalSteps) - 1) / (totalSteps - 1)) * 100}%` }}
        />

        {steps.map((step) => {
          const isCompleted = step.num < currentStep;
          const isCurrent = step.num === currentStep;

          return (
            <li key={step.num} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition shadow-sm ${
                  isCompleted
                    ? 'bg-teal-600 text-white'
                    : isCurrent
                    ? 'bg-teal-600 text-white ring-4 ring-teal-100'
                    : 'bg-white text-slate-500 border-2 border-slate-300'
                }`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : step.num}
              </div>
              <span
                className={`text-xs mt-2 font-medium hidden sm:block ${
                  isCurrent ? 'text-teal-900 font-bold' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
