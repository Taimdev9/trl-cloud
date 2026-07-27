import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Server, Lock, Mail, User, ArrowRight, AlertCircle, Loader2, Check, ShieldCheck } from 'lucide-react';

interface RegisterPageProps {
  setActiveTab: (tab: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ setActiveTab }) => {
  const { register, loginWithGoogle } = useAuth();
  const { language, t } = useLanguage();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy to create an account.');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await register(username, email, password, language);
    setLoading(false);

    if (res.success) {
      setActiveTab('dashboard');
    } else {
      setError(res.error || 'Registration failed');
    }
  };

  const handleGoogleSignIn = async () => {
    if (!agreedToTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy before continuing with Google.');
      return;
    }

    setGoogleLoading(true);
    setError(null);

    const mockGoogleProfile = {
      email: email.trim() ? email.trim() : `user${Math.floor(1000 + Math.random() * 9000)}@gmail.com`,
      name: username.trim() ? username.trim() : 'Google User',
      avatar: 'https://lh3.googleusercontent.com/a/default-user'
    };

    const res = await loginWithGoogle(mockGoogleProfile);
    setGoogleLoading(false);

    if (res.success) {
      setActiveTab('dashboard');
    } else {
      setError(res.error || 'Google Sign-In failed');
    }
  };

  return (
    <div className="py-12 px-4 max-w-md mx-auto">
      <div className="p-8 rounded-3xl bg-slate-900 border border-cyan-500/20 shadow-2xl space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 to-sky-500 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/20">
            <Server className="w-6 h-6 text-slate-950 font-bold" />
          </div>
          <h1 className="text-xl font-extrabold text-white">{t('registerTitle')}</h1>
          <p className="text-xs text-slate-400">Deploy & host your Node.js and Python Discord bots</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign-In Option */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-slate-200 bg-slate-950 hover:bg-slate-800 border border-slate-700/80 transition-all flex items-center justify-center gap-3 shadow-md active:scale-[0.99]"
        >
          {googleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
          ) : (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>Quick Sign Up with Google</span>
        </button>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            OR CREATE EMAIL ACCOUNT
          </span>
        </div>

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
                placeholder="DeveloperName"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
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
                placeholder="developer@trlcloud.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
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
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Terms checkbox */}
          <div className="flex items-start gap-2.5 pt-1">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 rounded bg-slate-950 border-slate-800 text-cyan-400 focus:ring-cyan-500/20"
            />
            <label htmlFor="terms" className="text-[11px] text-slate-400 leading-relaxed cursor-pointer">
              I agree to TRL Cloud{' '}
              <button
                type="button"
                onClick={() => setActiveTab('terms')}
                className="text-cyan-400 underline font-semibold"
              >
                Terms of Service
              </button>{' '}
              and{' '}
              <button
                type="button"
                onClick={() => setActiveTab('privacy')}
                className="text-cyan-400 underline font-semibold"
              >
                Privacy Policy
              </button>.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 transition-colors shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> : <ArrowRight className="w-4 h-4 text-slate-950" />}
            <span>{t('createAccountBtn')}</span>
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            onClick={() => setActiveTab('login')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            {t('alreadyHaveAccount')}
          </button>
        </div>

      </div>
    </div>
  );
};
