import React, { useState } from 'react';
import { LanguageCode, TriageEvaluateResponse, CaregiverProfile, DemoScenario, FollowUpAnswer } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { LandingPage } from './pages/LandingPage';
import { IntakeFlow } from './pages/IntakeFlow';
import { CaregiversPage } from './pages/CaregiversPage';
import { SummaryView } from './components/SummaryView';
import { DemoPanel } from './components/DemoPanel';
import { PrivacyPage } from './pages/PrivacyPage';
import { resetSession } from './services/api';

export const App: React.FC = () => {
  const [currentLang, setCurrentLang] = useState<LanguageCode>('en');
  const [activeTab, setActiveTab] = useState<string>('home'); // home, intake, caregivers, summary, demo, privacy

  // Global Session State
  const [userConcern, setUserConcern] = useState<string>('');
  const [triageResult, setTriageResult] = useState<TriageEvaluateResponse | null>(null);
  const [selectedCaregiver, setSelectedCaregiver] = useState<CaregiverProfile | null>(null);
  const [answers, setAnswers] = useState<FollowUpAnswer[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleResetSession = async () => {
    await resetSession();
    setUserConcern('');
    setTriageResult(null);
    setSelectedCaregiver(null);
    setAnswers([]);
    setActiveTab('home');
    showToast('Session memory cleared. No sensitive data saved.');
  };

  const handleStartGuidance = () => {
    setActiveTab('intake');
  };

  const handleFindCaregivers = () => {
    setActiveTab('caregivers');
  };

  const handleNavigateToCaregivers = (triage: TriageEvaluateResponse) => {
    setTriageResult(triage);
    setActiveTab('caregivers');
  };

  const handleSelectCaregiver = (profile: CaregiverProfile) => {
    setSelectedCaregiver(profile);
    showToast(`Caregiver ${profile.display_name} selected for your care plan.`);
  };

  const handleLoadDemoScenario = (scenario: DemoScenario) => {
    setUserConcern(scenario.input_text);
    setCurrentLang(scenario.language as LanguageCode);
    setActiveTab('intake');
    showToast(`Loaded benchmark scenario: ${scenario.id}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 antialiased selection:bg-teal-100 selection:text-teal-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 animate-fade-in"
        >
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <Header
        currentLang={currentLang}
        onSelectLang={(lang) => setCurrentLang(lang)}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onResetSession={handleResetSession}
      />

      {/* Trust & Safety Banner */}
      <DisclaimerBanner currentLang={currentLang} />

      {/* Main Content Pages */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {activeTab === 'home' && (
          <LandingPage
            currentLang={currentLang}
            onStartGuidance={handleStartGuidance}
            onFindCaregivers={handleFindCaregivers}
            onOpenDemo={() => setActiveTab('demo')}
          />
        )}

        {activeTab === 'intake' && (
          <IntakeFlow
            currentLang={currentLang}
            onNavigateToCaregivers={handleNavigateToCaregivers}
            onResetSession={handleResetSession}
            initialText={userConcern}
          />
        )}

        {activeTab === 'caregivers' && (
          <CaregiversPage
            currentLang={currentLang}
            triageResult={triageResult}
            onSelectCaregiver={handleSelectCaregiver}
            selectedCaregiverId={selectedCaregiver?.caregiver_id}
            onNavigateToSummary={() => setActiveTab('summary')}
          />
        )}

        {activeTab === 'summary' && (
          <SummaryView
            userConcern={userConcern || 'Care navigation session'}
            triageResult={triageResult}
            selectedCaregiver={selectedCaregiver}
            answers={answers}
            currentLang={currentLang}
            onEdit={() => setActiveTab('intake')}
            onReset={handleResetSession}
          />
        )}

        {activeTab === 'demo' && (
          <DemoPanel
            onLoadScenario={handleLoadDemoScenario}
            currentLang={currentLang}
          />
        )}

        {activeTab === 'privacy' && (
          <PrivacyPage
            currentLang={currentLang}
            onResetSession={handleResetSession}
          />
        )}
      </main>

      {/* Accessible Footer with 112 emergency phone call */}
      <Footer currentLang={currentLang} />
    </div>
  );
};

export default App;
