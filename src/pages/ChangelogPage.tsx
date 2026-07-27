import React from 'react';
import { Sparkles, Check, Rocket, Shield, Terminal, Zap, Code2, Bot } from 'lucide-react';

export const ChangelogPage: React.FC = () => {
  const releases = [
    {
      version: 'TRL Cloud v2.0',
      tag: 'Current Major Release',
      date: 'July 2026',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      highlights: [
        { type: 'New', text: 'Complete visual redesign with modern SaaS Cyan/Sky/Teal aesthetic & device-tailored responsive layouts.' },
        { type: 'New', text: 'Interactive 10-page Developer Documentation Center in 5 languages (English, Arabic, French, Turkish, Spanish).' },
        { type: 'New', text: 'General AI Assistant with Chat History, search, and granular "Allow AI to access my project" permission controls.' },
        { type: 'New', text: 'Public Release Mode with Terms of Service, Privacy Policy, User Feedback tool, and professional error pages (404/500).' },
        { type: 'Improved', text: 'Persistent User Account system & backend server database syncing automatically across sessions.' }
      ]
    },
    {
      version: 'TRL Cloud v1.7',
      tag: 'AI & Diagnostics Release',
      date: 'June 2026',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      highlights: [
        { type: 'New', text: 'Project Access Permission System for Gemini 3.6 Flash AI diagnostics.' },
        { type: 'New', text: 'Automatic crash log scanner detecting invalid tokens, missing packages, and gateway intents.' },
        { type: 'Fixed', text: 'Resolved WebSocket connection drops during process restarts.' }
      ]
    },
    {
      version: 'TRL Cloud v1.6',
      tag: 'Data Persistence & Discord OAuth',
      date: 'May 2026',
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
      highlights: [
        { type: 'New', text: 'Persistent JSON/SQLite database backing users, bots, env vars, and files.' },
        { type: 'New', text: 'Discord Single Sign-On (SSO) OAuth account linking.' },
        { type: 'Improved', text: 'Optimized RAM monitoring for background child processes.' }
      ]
    },
    {
      version: 'TRL Cloud v1.0',
      tag: 'Initial Engine',
      date: 'March 2026',
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
      highlights: [
        { type: 'New', text: 'Initial release of TRL Cloud hosting engine for Node.js (Discord.js) and Python (discord.py).' },
        { type: 'New', text: 'Browser ZIP uploader, GitHub repository cloner, and online web IDE.' }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-bold border border-cyan-500/30">
          <Rocket className="w-3.5 h-3.5 text-cyan-400" />
          <span>Product Updates & Version History</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          TRL Cloud Changelog
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          Track new feature rollouts, bug fixes, performance updates, and engine optimizations.
        </p>
      </div>

      {/* Releases Timeline */}
      <div className="space-y-8 relative before:absolute before:inset-0 before:left-3 sm:before:left-4 before:w-0.5 before:bg-slate-800">
        {releases.map((release, idx) => (
          <div key={idx} className="relative pl-8 sm:pl-10 space-y-3">
            
            {/* Timeline Dot */}
            <div className="absolute left-0 top-1.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-900 border-2 border-cyan-500 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
            </div>

            {/* Version Card */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-extrabold text-white">{release.version}</h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${release.badgeColor}`}>
                    {release.tag}
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-mono">{release.date}</span>
              </div>

              <div className="space-y-2">
                {release.highlights.map((item, hIdx) => (
                  <div key={hIdx} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold shrink-0 ${
                      item.type === 'New' ? 'bg-cyan-500/20 text-cyan-300' :
                      item.type === 'Improved' ? 'bg-emerald-500/20 text-emerald-300' :
                      'bg-sky-500/20 text-sky-300'
                    }`}>
                      {item.type}
                    </span>
                    <span className="leading-relaxed">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
