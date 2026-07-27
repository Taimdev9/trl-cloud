import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Server, MessageSquare, Github, Mail, Shield, Heart, FileText, Lock, Rocket } from 'lucide-react';

interface FooterProps {
  setActiveTab?: (tab: string) => void;
  onOpenFeedback?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab, onOpenFeedback }) => {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-950 border-t border-cyan-500/15 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand Info */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 to-sky-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Server className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <span className="font-extrabold text-xl text-white tracking-tight">TRL Cloud</span>
              <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                v2.0
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {t('brandTagline')}
          </p>
          <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/20">
            <p className="text-[10px] text-slate-400 font-medium">Developed with pride by</p>
            <p className="font-extrabold text-xs text-cyan-300">TRL TEAM FOR DEVELOPMENT</p>
          </div>
        </div>

        {/* Quick Navigation Links */}
        <div>
          <p className="text-xs font-bold text-white uppercase tracking-wider mb-4">Quick Navigation</p>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => setActiveTab?.('dashboard')} className="hover:text-cyan-400 transition-colors">
                {t('navDashboard')}
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab?.('docs')} className="hover:text-cyan-400 transition-colors">
                {t('navDocs')}
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab?.('changelog')} className="hover:text-cyan-400 transition-colors">
                Changelog v2.0
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab?.('status')} className="hover:text-cyan-400 transition-colors">
                {t('navStatus')}
              </button>
            </li>
          </ul>
        </div>

        {/* Legal & Feedback */}
        <div>
          <p className="text-xs font-bold text-white uppercase tracking-wider mb-4">Legal & Support</p>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => setActiveTab?.('terms')} className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Terms of Service</span>
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab?.('privacy')} className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Privacy Policy</span>
              </button>
            </li>
            <li>
              <button onClick={onOpenFeedback} className="hover:text-cyan-400 transition-colors flex items-center gap-1.5 text-cyan-300 font-semibold">
                <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                <span>Submit Developer Feedback</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Contact TRL TEAM */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-white uppercase tracking-wider mb-4">{t('contactUs')}</p>
          <a
            href="https://discord.gg/4FJG7jCGJ8"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:border-cyan-500/40 transition-all"
          >
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <span>{t('discordServer')}</span>
          </a>

          <a
            href="https://taimdev9.github.io/Taim.dev-My-experiences/#contact"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:border-cyan-500/40 transition-all"
          >
            <Github className="w-4 h-4 text-sky-400" />
            <span>{t('githubPage')}</span>
          </a>

          <a
            href="mailto:taymabdrabo723@gmail.com"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:border-cyan-500/40 transition-all truncate"
          >
            <Mail className="w-4 h-4 text-teal-400" />
            <span className="truncate">taymabdrabo723@gmail.com</span>
          </a>
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>© 2026 TRL Cloud v2.0. {t('rightsReserved')}</p>
        <div className="flex items-center gap-1 text-slate-400">
          <span>Created with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          <span>by</span>
          <span className="font-bold text-cyan-300">TRL TEAM FOR DEVELOPMENT</span>
        </div>
      </div>
    </footer>
  );
};
