import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  Bot, 
  Terminal, 
  Key, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  CheckCircle2,
  Server,
  Zap
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      icon: Bot,
      color: 'from-indigo-500 to-blue-600',
      title: t('onboardingStep1Title'),
      desc: t('onboardingStep1Desc'),
      highlights: ['ZIP File Drag & Drop', 'GitHub Repository Sync', 'In-Browser Online IDE']
    },
    {
      icon: Terminal,
      color: 'from-emerald-500 to-teal-600',
      title: t('onboardingStep2Title'),
      desc: t('onboardingStep2Desc'),
      highlights: ['Discord.js v14 & Discord.py', 'package.json & requirements.txt', 'Real Process Status']
    },
    {
      icon: Key,
      color: 'from-amber-500 to-orange-600',
      title: t('onboardingStep3Title'),
      desc: t('onboardingStep3Desc'),
      highlights: ['Hidden BOT_TOKEN Storage', 'Secure Backend Env Vars', 'Zero Public Token Exposure']
    },
    {
      icon: Sparkles,
      color: 'from-purple-500 to-pink-600',
      title: t('onboardingStep4Title'),
      desc: t('onboardingStep4Desc'),
      highlights: ['Gateway Intent Diagnostics', 'Syntax & Log Analyzer', 'Automated One-Click Fixes']
    }
  ];

  const activeStep = steps[currentStep];

  const handleFinish = () => {
    localStorage.setItem('trl_cloud_onboarding_completed', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Top Header Banner */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{t('onboardingTitle')}</h2>
              <p className="text-xs text-slate-400">{t('onboardingSubtitle')}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Content */}
        <div className="p-6 sm:p-8">
          
          {/* Step Badge */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-indigo-400 border border-indigo-500/20">
              Step {currentStep + 1} of {steps.length}
            </span>

            {/* Step Indicators */}
            <div className="flex items-center gap-1.5">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentStep
                      ? 'w-6 bg-indigo-500'
                      : idx < currentStep
                      ? 'w-2 bg-emerald-500'
                      : 'w-2 bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Active Step Card */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${activeStep.color} flex items-center justify-center text-white shadow-xl mb-4`}>
              <activeStep.icon className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-white mb-2">{activeStep.title}</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mb-6">
              {activeStep.desc}
            </p>

            {/* Feature Highlights */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-2">
              {activeStep.highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-left">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs text-slate-300 font-medium leading-tight">{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{t('btnPrevStep')}</span>
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 transition"
              >
                <span>{t('btnNextStep')}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition"
              >
                <Zap className="w-4 h-4" />
                <span>{t('btnFinishOnboarding')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
