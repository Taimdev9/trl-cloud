import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { HelpCircle, MessageSquare, Github, Mail, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export const SupportPage: React.FC = () => {
  const { user, getAuthHeader } = useAuth();
  const { t } = useLanguage();

  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<'technical' | 'billing' | 'feature' | 'other'>('technical');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setErrorMsg('Please fill in both subject and message.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({
          subject,
          category,
          message,
          userEmail: user?.email || 'user@trlcloud.com'
        })
      });

      if (res.ok) {
        setSuccessMsg('Support ticket submitted! TRL TEAM FOR DEVELOPMENT will review your request.');
        setSubject('');
        setMessage('');
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to submit ticket.');
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      
      <div className="space-y-2 text-center sm:text-left">
        <h1 className="text-2xl font-extrabold text-white">{t('supportTitle')}</h1>
        <p className="text-xs text-slate-400">{t('supportDesc')}</p>
      </div>

      {/* Direct Contact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <a
          href="https://discord.gg/4FJG7jCGJ8"
          target="_blank"
          rel="noopener noreferrer"
          className="p-5 rounded-2xl bg-[#5865F2]/10 border border-[#5865F2]/30 hover:border-[#5865F2] transition-all flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#5865F2] text-white flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-xs text-white">Discord Server</p>
            <p className="text-[10px] text-slate-400 group-hover:text-indigo-300">Join Community</p>
          </div>
        </a>

        <a
          href="https://taimdev9.github.io/Taim.dev-My-experiences/#contact"
          target="_blank"
          rel="noopener noreferrer"
          className="p-5 rounded-2xl bg-purple-950/20 border border-purple-500/30 hover:border-purple-400 transition-all flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
            <Github className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-xs text-white">GitHub Contact</p>
            <p className="text-[10px] text-slate-400 group-hover:text-purple-300">View Experiences</p>
          </div>
        </a>

        <a
          href="mailto:taymabdrabo723@gmail.com"
          className="p-5 rounded-2xl bg-blue-950/20 border border-blue-500/30 hover:border-blue-400 transition-all flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div className="truncate">
            <p className="font-bold text-xs text-white">Direct Email</p>
            <p className="text-[10px] text-slate-400 truncate group-hover:text-blue-300">taymabdrabo723@gmail.com</p>
          </div>
        </a>

      </div>

      {/* Ticket Submission Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0f1117] border border-indigo-500/20 shadow-2xl space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <HelpCircle className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-extrabold text-white">{t('submitTicket')}</h2>
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">{t('ticketSubject')}</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Bot crashes on discord.js start"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">{t('ticketCategory')}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="technical">Technical Support</option>
                <option value="billing">Hosting Request</option>
                <option value="feature">Feature Suggestion</option>
                <option value="other">Other Inquiry</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">{t('ticketMessage')}</label>
            <textarea
              rows={5}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Explain your problem or question in detail..."
              className="w-full p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>{t('btnSendTicket')}</span>
          </button>
        </form>
      </div>

    </div>
  );
};
