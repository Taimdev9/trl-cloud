import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Language } from '../types';
import { 
  Server, 
  Globe, 
  Bell, 
  User as UserIcon, 
  LogOut, 
  ChevronDown, 
  ShieldAlert, 
  Cpu, 
  Menu, 
  X,
  Code2,
  HelpCircle,
  Activity,
  Box,
  Sun,
  Moon,
  Bot,
  Sparkles,
  Info
} from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';
import { MusicPlayer } from './MusicPlayer';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  toggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  onOpenOnboarding?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, toggleSidebar, isSidebarOpen, onOpenOnboarding }) => {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLangSelect = (lang: Language) => {
    setLanguage(lang);
    setShowLangMenu(false);
  };

  const languagesList: { code: Language; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-cyan-500/15 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left Side: Logo & Sidebar Toggle */}
          <div className="flex items-center gap-3">
            {user && (
              <button 
                onClick={toggleSidebar}
                className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
                title="Toggle Menu"
              >
                {isSidebarOpen ? <X className="w-5 h-5 text-cyan-400" /> : <Menu className="w-5 h-5 text-cyan-400" />}
              </button>
            )}

            <div 
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-teal-400 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                <Server className="w-5 h-5 text-slate-950 font-bold" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-cyan-200 to-sky-300 bg-clip-text text-transparent">
                    TRL Cloud
                  </span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    V1.6
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                  Discord Bot Hosting
                </p>
              </div>
            </div>
          </div>

          {/* Center Navigation Links (for Desktop/Visitor) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'home' 
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {t('navHome')}
            </button>

            {user && (
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'dashboard' 
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {t('navDashboard')}
              </button>
            )}

            <button
              onClick={() => setActiveTab('templates')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'templates' 
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {t('navTemplates')}
            </button>

            <button
              onClick={() => setActiveTab('status')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'status' 
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {t('navStatus')}
            </button>

            <button
              onClick={() => setActiveTab('docs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'docs' 
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {t('navDocs')}
            </button>

            <button
              onClick={() => setActiveTab('support')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'support' 
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {t('navSupport')}
            </button>

            <button
              onClick={() => setActiveTab('ai-assistant')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'ai-assistant' 
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' 
                  : 'text-cyan-300 hover:text-white hover:bg-cyan-950/40'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI Assistant</span>
            </button>

            <button
              onClick={() => setActiveTab('ai-info')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'ai-info' 
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>AI Info</span>
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'about' 
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              About Team
            </button>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Background Music Player */}
            <MusicPlayer />

            {/* Platform Guide Onboarding Trigger */}
            {onOpenOnboarding && (
              <button
                onClick={onOpenOnboarding}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 hover:text-white hover:border-cyan-500/60 text-xs font-semibold transition"
                title="Platform Onboarding Guide"
              >
                <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t('btnOpenGuide')}</span>
              </button>
            )}

            {/* Theme Switcher Button */}
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-amber-400 hover:text-amber-300 hover:bg-slate-800/80 transition"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
            </button>

            {/* Language Selector Button */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-medium transition-all"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span className="uppercase font-bold">{language}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-36 rounded-xl bg-slate-900 border border-cyan-500/20 shadow-xl py-1 z-50 animate-fadeIn">
                  {languagesList.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLangSelect(lang.code)}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800/60 transition-colors ${
                        language === lang.code ? 'text-cyan-400 font-bold bg-cyan-500/10' : 'text-slate-300'
                      }`}
                    >
                      <span>{lang.name}</span>
                      <span className="text-sm">{lang.flag}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications Bell */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all relative"
                  title={t('notifications')}
                >
                  <Bell className="w-4 h-4 text-cyan-400" />
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                </button>

                {showNotifications && (
                  <NotificationDropdown onClose={() => setShowNotifications(false)} />
                )}
              </div>
            )}

            {/* User Account or Auth Buttons */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 hover:border-cyan-500/60 transition-all"
                >
                  <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-xs font-bold text-slate-950">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-slate-200 max-w-[100px] truncate hidden sm:block">
                    {user.username}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-cyan-500/20 shadow-2xl py-1 z-50 divide-y divide-slate-800/80">
                    <div className="px-3 py-2">
                      <p className="text-xs font-bold text-white truncate">{user.username}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        user.role === 'admin' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-cyan-500/20 text-cyan-300'
                      }`}>
                        {user.role}
                      </span>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => { setActiveTab('profile'); setShowUserMenu(false); }}
                        className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 flex items-center gap-2"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{t('navProfile')}</span>
                      </button>

                      {user.role === 'admin' && (
                        <button
                          onClick={() => { setActiveTab('admin'); setShowUserMenu(false); }}
                          className="w-full text-left px-3 py-2 text-xs text-amber-300 hover:text-amber-100 hover:bg-amber-950/30 flex items-center gap-2"
                        >
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                          <span>{t('navAdmin')}</span>
                        </button>
                      )}
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => { logout(); setShowUserMenu(false); setActiveTab('home'); }}
                        className="w-full text-left px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{t('navLogout')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('login')}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all"
                >
                  {t('navLogin')}
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 shadow-md shadow-cyan-500/20 transition-all"
                >
                  {t('navRegister')}
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
