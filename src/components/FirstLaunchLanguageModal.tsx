import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../types';
import { Globe, Check, Sparkles, ArrowRight } from 'lucide-react';

interface FirstLaunchLanguageModalProps {
  onComplete: () => void;
}

export const FirstLaunchLanguageModal: React.FC<FirstLaunchLanguageModalProps> = ({ onComplete }) => {
  const { language, setLanguage, t } = useLanguage();
  const [selectedLang, setSelectedLang] = useState<Language>(language || 'en');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const configured = localStorage.getItem('trl_cloud_lang_configured');
    if (!configured) {
      setIsVisible(true);
    }
  }, []);

  const handleConfirm = () => {
    setLanguage(selectedLang);
    localStorage.setItem('trl_cloud_lang_configured', 'true');
    setIsVisible(false);
    onComplete();
  };

  if (!isVisible) return null;

  const languagesList: { id: Language; name: string; nativeName: string; flag: string; isRtl?: boolean }[] = [
    { id: 'en', name: 'English', nativeName: 'English (US)', flag: '🇺🇸' },
    { id: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', isRtl: true },
    { id: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { id: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
    { id: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-indigo-500/30 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Glow decoration */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="p-6 sm:p-8 relative z-10">
          
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-1">
                <Sparkles className="w-3 h-3" />
                {t('langModalTag')}
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {t('langModalTitle')}
              </h2>
            </div>
          </div>

          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            {t('langModalSubtitle')}
          </p>

          {/* Languages Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {languagesList.map((lang) => {
              const isSelected = selectedLang === lang.id;
              return (
                <button
                  key={lang.id}
                  onClick={() => setSelectedLang(lang.id)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all duration-200 ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl leading-none">{lang.flag}</span>
                    <div>
                      <div className="text-sm font-semibold text-white">{lang.nativeName}</div>
                      <div className="text-[11px] text-slate-400">{lang.name}</div>
                    </div>
                  </div>

                  <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-indigo-500 text-white' : 'border border-slate-600'
                  }`}>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Action Button */}
          <button
            onClick={handleConfirm}
            className="w-full py-3.5 px-5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all"
          >
            <span>{t('confirmLanguage')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
