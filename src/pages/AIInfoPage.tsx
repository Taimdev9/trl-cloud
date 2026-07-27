import React from 'react';
import { Bot, Sparkles, Shield, Code, Server, Globe, ExternalLink, Heart, Cpu } from 'lucide-react';

export const AIInfoPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Hero Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-purple-400" />
          AI Platform Information
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          About Cloud Bot & TRL Cloud
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
          Learn more about our intelligent assistant engine, developers, and platform architecture powering Next-Gen Discord Bot Hosting.
        </p>
      </div>

      {/* Primary Identity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-center space-y-3 shadow-xl hover:border-purple-500/40 transition">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">AI Assistant Name</span>
            <h3 className="text-xl font-extrabold text-white mt-1">Cloud Bot</h3>
          </div>
          <p className="text-xs text-slate-400">
            Smart Discord Bot Coding, Log Analyzer & Troubleshooting AI Engine.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-center space-y-3 shadow-xl hover:border-purple-500/40 transition">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Project Name</span>
            <h3 className="text-xl font-extrabold text-white mt-1">TRL Cloud</h3>
          </div>
          <p className="text-xs text-slate-400">
            High-Performance Cloud Bot Hosting & Live Container Engine.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-center space-y-3 shadow-xl hover:border-purple-500/40 transition">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Code className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Developer & Team</span>
            <h3 className="text-lg font-bold text-white mt-1">TRL TEAM FOR DEVELOPMENT</h3>
          </div>
          <p className="text-xs text-slate-400">
            Engineered with passion for the developer community.
          </p>
        </div>
      </div>

      {/* Tech Specifications & Architecture */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-purple-400" />
          Technical Specifications
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-400">AI Model Provider</span>
            <span className="font-semibold text-slate-100">Google Gemini</span>
          </div>

          <div className="flex justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-400">Default Model</span>
            <span className="font-semibold text-emerald-400 font-mono">gemini-3.6-flash</span>
          </div>

          <div className="flex justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-400">API Architecture</span>
            <span className="font-semibold text-slate-100">Server-Side Proxy (/api/ai)</span>
          </div>

          <div className="flex justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-400">Security Standard</span>
            <span className="font-semibold text-purple-300">Environment Variables Only</span>
          </div>
        </div>
      </div>

      {/* Contact & Links */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-sm font-bold text-white">Need Support or Have Questions?</h3>
          <p className="text-xs text-slate-400">Connect with TRL TEAM FOR DEVELOPMENT on Discord or GitHub.</p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://discord.gg/4FJG7jCGJ8"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow"
          >
            <span>Discord Server</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <a
            href="https://taimdev9.github.io/Taim.dev-My-experiences/#contact"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
          >
            <span>Developer Portfolio</span>
            <Globe className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
