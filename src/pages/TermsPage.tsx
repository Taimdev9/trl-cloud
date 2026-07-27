import React from 'react';
import { Shield, FileText } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
      
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-bold border border-cyan-500/30">
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          <span>Legal & Service Agreements</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Terms of Service</h1>
        <p className="text-slate-400 text-xs">Last updated: July 2026 • TRL TEAM FOR DEVELOPMENT</p>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="font-bold text-white text-sm text-cyan-300">1. Acceptance of Terms</h2>
        <p>By registering or using TRL Cloud hosting services, you agree to comply with these terms, Discord API Terms of Service, and all applicable laws.</p>

        <h2 className="font-bold text-white text-sm text-cyan-300">2. Prohibited Content & Abuse</h2>
        <p>Users are strictly forbidden from hosting self-bots, raid tools, token scrapers, crypto miners, DDoS tools, or malware on TRL Cloud. Violation will result in immediate ban and container termination.</p>

        <h2 className="font-bold text-white text-sm text-cyan-300">3. Service Availability</h2>
        <p>TRL Cloud strives for 99.9% uptime. Scheduled maintenance windows will be broadcasted on the System Status page.</p>

        <h2 className="font-bold text-white text-sm text-cyan-300">4. Data Safety</h2>
        <p>You retain full copyright and ownership of your bot source code and environment variables.</p>
      </div>

    </div>
  );
};
