import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Bot, 
  Code2, 
  Box, 
  Activity, 
  BookOpen, 
  HelpCircle, 
  ShieldAlert, 
  PlusCircle, 
  User as UserIcon,
  MessageSquare,
  Users,
  Sparkles,
  Info
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen?: boolean;
  onOpenCreateModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen = true, onOpenCreateModal }) => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const navItems = [
    { id: 'dashboard', label: t('navDashboard'), icon: LayoutDashboard },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Sparkles },
    { id: 'ai-info', label: 'AI Platform Info', icon: Info },
    { id: 'bots', label: t('navMyBots'), icon: Bot },
    { id: 'editor', label: t('navCodeEditor'), icon: Code2 },
    { id: 'templates', label: t('navTemplates'), icon: Box },
    { id: 'status', label: t('navStatus'), icon: Activity },
    { id: 'docs', label: t('navDocs'), icon: BookOpen },
    { id: 'support', label: t('navSupport'), icon: HelpCircle },
    { id: 'about', label: 'About TRL Team', icon: Users },
    { id: 'profile', label: t('navProfile'), icon: UserIcon }
  ];

  if (user?.role === 'admin') {
    navItems.push({ id: 'admin', label: t('navAdmin'), icon: ShieldAlert });
  }

  return (
    <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-[#0a0c10] border-r border-indigo-500/10 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
      isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    }`}>
      
      <div className="p-4 space-y-6">
        
        {/* Quick Create Bot CTA */}
        {onOpenCreateModal && (
          <button
            onClick={onOpenCreateModal}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('createBotTitle')}</span>
          </button>
        )}

        {/* Menu Items */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] uppercase tracking-wider font-extrabold text-slate-500 mb-2">
            Platform Hub
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Footer Creator Badge */}
      <div className="p-4 m-3 rounded-2xl bg-gradient-to-b from-slate-900/80 to-indigo-950/30 border border-indigo-500/15">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Created By</span>
        </div>
        <p className="font-extrabold text-xs text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
          TRL TEAM FOR DEVELOPMENT
        </p>
        <a 
          href="https://discord.gg/4FJG7jCGJ8" 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-2 text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
        >
          <MessageSquare className="w-3 h-3" />
          <span>Join TRL Discord</span>
        </a>
      </div>

    </aside>
  );
};
