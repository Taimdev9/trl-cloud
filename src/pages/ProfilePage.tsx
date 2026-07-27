import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../types';
import { User, Globe, Key, Save, CheckCircle2, AlertCircle, Loader2, Shield } from 'lucide-react';
import { DiscordSection } from '../components/DiscordSection';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [username, setUsername] = useState(user?.username || '');
  const [password, setPassword] = useState('');
  const [selectedLang, setSelectedLang] = useState<Language>(language);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const result = await updateProfile({
      username,
      language: selectedLang,
      password: password.length >= 6 ? password : undefined
    });

    setLoading(false);

    if (result.success) {
      setLanguage(selectedLang);
      setSuccessMsg('Profile settings updated successfully!');
      setPassword('');
    } else {
      setErrorMsg(result.error || 'Failed to update profile');
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-2xl mx-auto">
      
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-white">{t('navProfile')}</h1>
        <p className="text-xs text-slate-400">Manage your account information, language, and security settings</p>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-[#0f1117] border border-indigo-500/20 shadow-2xl space-y-6">
        
        {/* User Card */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-lg text-white">
            {user?.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-extrabold text-sm text-white">{user?.username}</p>
            <p className="text-xs text-slate-400">{user?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300">
              {user?.role} Account
            </span>
          </div>
        </div>

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">{t('usernameLabel')}</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Preferred Platform Language</label>
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value as Language)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="en">English 🇺🇸</option>
              <option value="ar">العربية 🇸🇦</option>
              <option value="fr">Français 🇫🇷</option>
              <option value="tr">Türkçe 🇹🇷</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">New Password (optional)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Profile Settings</span>
          </button>
        </form>

      </div>

      {/* Discord Section */}
      <DiscordSection />

    </div>
  );
};
