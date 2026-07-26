import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Server, Lock, Mail, ArrowRight, AlertCircle, Loader2, ShieldAlert, User } from 'lucide-react';
import { VerifyEmailModal } from '../components/VerifyEmailModal';

interface LoginPageProps {
  setActiveTab: (tab: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ setActiveTab }) => {
  const { login, pendingEmail, setPendingEmail } = useAuth();
  const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await login(email, password);
    setLoading(false);

    if (res.requireVerification) {
      return;
    }

    if (res.success) {
      setActiveTab('dashboard');
    } else {
      setError(res.error || 'Login failed');
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setLoading(true);
    setError(null);

    const res = await login(demoEmail, demoPass);
    setLoading(false);

    if (res.success) {
      setActiveTab('dashboard');
    } else {
      setError(res.error || 'Demo login failed');
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
          <h1 className="text-xl font-extrabold text-white">{t('loginTitle')}</h1>
          <p className="text-xs text-slate-400">Sign in to manage your Discord bot hosting instances</p>
        </div>

        {/* Demo Quick Login Shortcuts */}
        <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-2">
          <p className="text-[10px] uppercase font-extrabold tracking-wider text-indigo-300 text-center">
            Instant Demo Credentials
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('user@trlcloud.com', 'user123')}
              className="py-2 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-xs font-bold border border-indigo-500/30 transition-colors flex items-center justify-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>{t('demoLoginUser')}</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('admin@trlcloud.com', 'admin123')}
              className="py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 text-xs font-bold border border-amber-500/30 transition-colors flex items-center justify-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{t('demoLoginAdmin')}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">{t('emailLabel')}</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@trlcloud.com"
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
            <span>{t('navLogin')}</span>
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => setActiveTab('register')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            {t('dontHaveAccount')}
          </button>
        </div>

      </div>
    </div>
  );
};
