import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Server, MessageSquare, Github, Mail, ShieldCheck, Cpu, Code2, Users, Heart, Zap, Globe, Sparkles } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-6 animate-fadeIn">
      
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0e111a] via-[#121624] to-[#0a0c12] border border-indigo-500/20 p-8 md:p-12 shadow-2xl text-center space-y-6">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-xs font-bold tracking-wide">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>OFFICIAL DEVELOPER TEAM</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
          TRL TEAM FOR DEVELOPMENT
        </h1>

        <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          We build high-performance Discord bot hosting solutions, cloud management platforms, and developer tooling engineered for zero-latency uptime and supreme reliability.
        </p>

        {/* Contact Quick Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <a
            href="https://discord.gg/4FJG7jCGJ8"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-2xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#5865F2]/25 transition-all transform hover:-translate-y-0.5"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Join Discord Community</span>
          </a>

          <a
            href="https://taimdev9.github.io/Taim.dev-My-experiences/#contact"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-2xl bg-gray-900 hover:bg-gray-800 border border-gray-700 text-white font-bold text-xs flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <Github className="w-4 h-4 text-purple-400" />
            <span>GitHub Portfolio</span>
          </a>

          <a
            href="mailto:taymabdrabo723@gmail.com"
            className="px-5 py-3 rounded-2xl bg-indigo-950 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-200 font-bold text-xs flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <Mail className="w-4 h-4 text-blue-400" />
            <span>taymabdrabo723@gmail.com</span>
          </a>
        </div>
      </div>

      {/* Mission & Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-[#0f1117] border border-indigo-500/15 shadow-xl space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold text-white">Instant Deployment</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Upload zip files or edit code in real-time. TRL Cloud automatically initializes Node.js and Python environments in seconds.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#0f1117] border border-purple-500/15 shadow-xl space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold text-white">Security First</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Protected with CAPTCHA, JWT authorization, rate limiters, token masking, and private per-user database isolation.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#0f1117] border border-emerald-500/15 shadow-xl space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold text-white">AI Error Diagnostics</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Integrated AI Error Assistant detects missing packages, invalid tokens, and syntax crashes with instant fix guidance.
          </p>
        </div>
      </div>

      {/* Direct Contact Card */}
      <div className="p-8 rounded-3xl bg-[#0d0e15] border border-indigo-500/20 shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Contact & Support Channels</h2>
            <p className="text-xs text-slate-400">Get in touch directly with TRL TEAM FOR DEVELOPMENT</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a
            href="https://discord.gg/4FJG7jCGJ8"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-gray-950 border border-gray-800 hover:border-indigo-500/50 transition-all flex flex-col items-center text-center space-y-2 group"
          >
            <MessageSquare className="w-6 h-6 text-[#5865F2] group-hover:scale-110 transition-transform" />
            <span className="font-bold text-xs text-white">Discord Server</span>
            <span className="text-[10px] text-slate-400 font-mono">discord.gg/4FJG7jCGJ8</span>
          </a>

          <a
            href="https://taimdev9.github.io/Taim.dev-My-experiences/#contact"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-gray-950 border border-gray-800 hover:border-indigo-500/50 transition-all flex flex-col items-center text-center space-y-2 group"
          >
            <Globe className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-xs text-white">Official Website</span>
            <span className="text-[10px] text-slate-400 font-mono">taimdev9.github.io</span>
          </a>

          <a
            href="mailto:taymabdrabo723@gmail.com"
            className="p-4 rounded-2xl bg-gray-950 border border-gray-800 hover:border-indigo-500/50 transition-all flex flex-col items-center text-center space-y-2 group"
          >
            <Mail className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-xs text-white">Email Address</span>
            <span className="text-[10px] text-slate-400 font-mono truncate max-w-full">taymabdrabo723@gmail.com</span>
          </a>
        </div>
      </div>

    </div>
  );
};
