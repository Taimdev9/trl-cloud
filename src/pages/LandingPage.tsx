import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  Server, 
  UploadCloud, 
  Code2, 
  Github, 
  Terminal, 
  Activity, 
  ShieldCheck, 
  Cpu, 
  Zap, 
  MessageSquare, 
  ArrowRight, 
  ChevronRight, 
  CheckCircle2, 
  Layers, 
  Clock, 
  Globe
} from 'lucide-react';

interface LandingPageProps {
  setActiveTab: (tab: string) => void;
  onOpenCreateModal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setActiveTab, onOpenCreateModal }) => {
  const { t } = useLanguage();
  const { user } = useAuth();

  return (
    <div className="space-y-20 pb-16">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-sky-500/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          
          {/* Developed By Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-cyan-500/30 text-xs font-semibold text-cyan-300 shadow-xl">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>Created by <strong className="text-white">TRL TEAM FOR DEVELOPMENT</strong></span>
          </div>

          {/* Hero Title */}
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            {t('heroTitle')}
          </h1>

          {/* Hero Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            {t('heroSubtitle')}
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => {
                if (user) {
                  onOpenCreateModal();
                } else {
                  setActiveTab('register');
                }
              }}
              className="px-6 py-3.5 rounded-2xl text-sm font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 shadow-xl shadow-cyan-500/20 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 active:scale-95"
            >
              <span>{t('getStartedFree')}</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>

            <button
              onClick={() => setActiveTab('templates')}
              className="px-6 py-3.5 rounded-2xl text-sm font-semibold text-slate-200 bg-slate-900/80 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 transition-all flex items-center gap-2"
            >
              <span>{t('exploreTemplates')}</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Live Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-10 max-w-3xl mx-auto">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-cyan-500/15 backdrop-blur-md">
              <p className="text-2xl font-black text-white">12,450+</p>
              <p className="text-xs text-slate-400 font-medium">{t('activeBotsCount')}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-cyan-500/15 backdrop-blur-md">
              <p className="text-2xl font-black text-emerald-400">99.98%</p>
              <p className="text-xs text-slate-400 font-medium">{t('uptimePercent')}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-cyan-500/15 backdrop-blur-md col-span-2 md:col-span-1">
              <p className="text-2xl font-black text-cyan-400">3,800+</p>
              <p className="text-xs text-slate-400 font-medium">{t('registeredUsersCount')}</p>
            </div>
          </div>

        </div>
      </section>

      {/* 4 Bot Upload Methods Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Multi-Method Bot Deployment</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Multiple Ways To Add Your Bot</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Whether you have a local ZIP file, a GitHub repository, or want to write code right inside your browser, TRL Cloud supports it all.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Method 1 */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-cyan-500/20 hover:border-cyan-500/40 transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">{t('featureZipTitle')}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('featureZipDesc')}
            </p>
          </div>

          {/* Method 2 */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-cyan-500/20 hover:border-cyan-500/40 transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Code2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">{t('featureEditorTitle')}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('featureEditorDesc')}
            </p>
          </div>

          {/* Method 3 */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-cyan-500/20 hover:border-cyan-500/40 transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Github className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">{t('featureGitTitle')}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('featureGitDesc')}
            </p>
          </div>

          {/* Method 4 */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-cyan-500/20 hover:border-cyan-500/40 transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Terminal className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">{t('featureLogsTitle')}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('featureLogsDesc')}
            </p>
          </div>

        </div>
      </section>

      {/* Languages & Frameworks Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-cyan-500/20 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Supported Languages</span>
            <h3 className="text-2xl font-extrabold text-white">JavaScript & Python Discord Bots</h3>
            <p className="text-xs text-slate-300 max-w-md">
              Full automated environment setup with dependency installers (package.json & requirements.txt).
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-700 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div>
                <p className="text-xs font-bold text-white">JavaScript / Node.js</p>
                <p className="text-[10px] text-slate-400">Discord.js v14</p>
              </div>
            </div>

            <div className="px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-700 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-400"></div>
              <div>
                <p className="text-xs font-bold text-white">Python</p>
                <p className="text-[10px] text-slate-400">discord.py / disnake</p>
              </div>
            </div>

            <div className="px-4 py-3 rounded-2xl bg-slate-900/40 border border-slate-800 flex items-center gap-3 opacity-60">
              <div className="w-3 h-3 rounded-full bg-slate-500"></div>
              <div>
                <p className="text-xs font-bold text-slate-300">Java & C#</p>
                <p className="text-[10px] text-slate-500">Coming Soon</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Creator Highlight & Discord Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-tr from-slate-900 via-slate-900 to-cyan-950/60 border border-cyan-500/30 relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8">
          
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/30">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Official Development Team</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              TRL TEAM FOR DEVELOPMENT
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Have questions, need custom hosting options, or want to meet our community? Join our Discord server or reach out directly to our engineering team.
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2">
              <a
                href="https://discord.gg/4FJG7jCGJ8"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#5865F2] hover:bg-[#4752C4] transition-colors flex items-center gap-2 shadow-lg shadow-[#5865F2]/20"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Join Official Discord</span>
              </a>

              <a
                href="mailto:taymabdrabo723@gmail.com"
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-700 hover:bg-slate-800 transition-colors"
              >
                taymabdrabo723@gmail.com
              </a>
            </div>
          </div>

          <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-cyan-500 to-sky-500 flex items-center justify-center shadow-2xl shadow-cyan-500/20 shrink-0 rotate-3">
            <Server className="w-16 h-16 text-slate-950 font-bold" />
          </div>

        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-white">{t('faqTitle')}</h2>
          <p className="text-xs text-slate-400">Everything you need to know about TRL Cloud Discord Bot hosting.</p>
        </div>

        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <h4 className="text-sm font-bold text-white mb-1.5">How do I get my Discord Bot Token?</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Visit the Discord Developer Portal (discord.com/developers), create an Application, click "Bot", and copy the token. Paste it into your TRL Cloud project Environment Variables as <code className="text-cyan-300 bg-slate-950 px-1 py-0.5 rounded">BOT_TOKEN</code>.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <h4 className="text-sm font-bold text-white mb-1.5">Can I host Python and Node.js bots at the same time?</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Yes! TRL Cloud allows you to create unlimited test projects in both Node.js (Discord.js v14) and Python (discord.py).
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <h4 className="text-sm font-bold text-white mb-1.5">Are dependencies installed automatically?</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Yes. When you upload a ZIP or import from GitHub, TRL Cloud detects <code className="text-cyan-300 bg-slate-950 px-1 py-0.5 rounded">package.json</code> or <code className="text-cyan-300 bg-slate-950 px-1 py-0.5 rounded">requirements.txt</code> and installs required packages automatically.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
