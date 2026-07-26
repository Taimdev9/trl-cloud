import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Server, Lock, Mail, User, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { VerifyEmailModal } from '../components/VerifyEmailModal';

interface RegisterPageProps {
  setActiveTab: (tab: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ setActiveTab }) => {
  const { register, pendingEmail, setPendingEmail } = useAuth();
  const { language, t } = useLanguage();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await register(username, email, password, language);
    setLoading(false);

    if (res.requireVerification) {
      // Modal pops up automatically via pendingEmail
      return;
    }

    if (res.success) {
      setActiveTab('dashboard');
    } else {
      setError(res.error || 'Registration failed');
    }
  };

  return (
    <div className="py-12 px-4 max-w-md mx-auto">
      {pendingEmail && (
        <VerifyEmailModal
          email={pendingEmail}
          onClose={() => setPendingEmail(null)}
          onSuccess={() => setActiveTab('dashboard')}
        />
      )}

      <div className="p-8 rounded-3xl bg-[#0f1117] border border-indigo-500/20 shadow-2xl space-y-6">
        
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30">
            <Server className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-extrabold text-white">{t('registerTitle')}</h1>
          <p className="text-xs text-slate-400">Deploy & host your Node.js and Python Discord bots</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">{t('usernameLabel')}</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="DeveloperTag"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">{t('emailLabel')}</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">{t('passwordLabel')}</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            <span>{t('navRegister')}</span>
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => setActiveTab('login')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            {t('alreadyHaveAccount')}
          </button>
        </div>

      </div>
    </div>
  );
};
