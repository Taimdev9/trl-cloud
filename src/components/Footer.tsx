import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Server, MessageSquare, Github, Mail, Shield, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#050608] border-t border-indigo-500/10 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand Info */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Server className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-xl text-white tracking-tight">TRL Cloud</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {t('brandTagline')}
          </p>
          <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20">
            <p className="text-[10px] text-slate-400 font-medium">Developed with pride by</p>
            <p className="font-extrabold text-xs text-indigo-300">TRL TEAM FOR DEVELOPMENT</p>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <p className="text-xs font-bold text-white uppercase tracking-wider mb-4">Quick Navigation</p>
          <ul className="space-y-2 text-xs">
            <li><a href="#dashboard" className="hover:text-indigo-400 transition-colors">{t('navDashboard')}</a></li>
            <li><a href="#templates" className="hover:text-indigo-400 transition-colors">{t('navTemplates')}</a></li>
            <li><a href="#status" className="hover:text-indigo-400 transition-colors">{t('navStatus')}</a></li>
            <li><a href="#docs" className="hover:text-indigo-400 transition-colors">{t('navDocs')}</a></li>
          </ul>
        </div>

        {/* Supported Languages */}
        <div>
          <p className="text-xs font-bold text-white uppercase tracking-wider mb-4">Supported Stack</p>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Node.js (Discord.js v14)</span>
            </li>
            <li className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <span>Python (Discord.py)</span>
            </li>
            <li className="flex items-center gap-2 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>Java & C# (Coming Soon)</span>
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
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:border-indigo-500/40 transition-all"
          >
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <span>{t('discordServer')}</span>
          </a>

          <a
            href="https://taimdev9.github.io/Taim.dev-My-experiences/#contact"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:border-indigo-500/40 transition-all"
          >
            <Github className="w-4 h-4 text-purple-400" />
            <span>{t('githubPage')}</span>
          </a>

          <a
            href="mailto:taymabdrabo723@gmail.com"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:border-indigo-500/40 transition-all truncate"
          >
            <Mail className="w-4 h-4 text-blue-400" />
            <span className="truncate">taymabdrabo723@gmail.com</span>
          </a>
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>© 2026 TRL Cloud. {t('rightsReserved')}</p>
        <div className="flex items-center gap-1 text-slate-400">
          <span>Created with</span>
          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
          <span>by</span>
          <span className="font-bold text-indigo-300">TRL TEAM FOR DEVELOPMENT</span>
        </div>
      </div>
    </footer>
  );
};
