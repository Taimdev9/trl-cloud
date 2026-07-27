import React from 'react';
import { Lock, Shield } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
      
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-bold border border-cyan-500/30">
          <Lock className="w-3.5 h-3.5 text-cyan-400" />
          <span>User Data Protection</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Privacy Policy</h1>
        <p className="text-slate-400 text-xs">Last updated: July 2026 • TRL Cloud Security Team</p>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="font-bold text-white text-sm text-cyan-300">1. Information We Collect</h2>
        <p>We collect essential account details (username, email, hashed password, connected Discord ID) and bot configuration parameters required to run your containers.</p>

        <h2 className="font-bold text-white text-sm text-cyan-300">2. Bot Tokens & Secret Encryption</h2>
        <p>Your Discord Bot Tokens and environment variables are stored encrypted at rest in server databases. They are never exposed to public view or third parties.</p>

        <h2 className="font-bold text-white text-sm text-cyan-300">3. AI Assistant Privacy Controls</h2>
        <p>Cloud Bot AI respects your privacy preferences. AI does NOT inspect your project code or logs unless you explicitly enable the "Allow AI to access my project" setting in the AI Assistant tab.</p>
      </div>

    </div>
  );
};
