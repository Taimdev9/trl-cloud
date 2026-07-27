import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  Home, 
  LayoutDashboard, 
  Bot, 
  Code2, 
  Sparkles, 
  Menu
} from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  toggleSidebar: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab, toggleSidebar }) => {
  const { t } = useLanguage();

  const mainItems = [
    { id: 'home', label: t('navHome'), icon: Home },
    { id: 'dashboard', label: t('navDashboard'), icon: LayoutDashboard },
    { id: 'bots', label: t('navMyBots'), icon: Bot },
    { id: 'editor', label: t('navCodeEditor'), icon: Code2 },
    { id: 'ai-assistant', label: 'AI', icon: Sparkles }
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-cyan-500/15 py-2 px-3 lg:hidden flex items-center justify-around shadow-2xl">
      {mainItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 py-1 rounded-xl transition-all ${
              isActive
                ? 'text-cyan-400 bg-cyan-500/10 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400 scale-110' : 'text-slate-400'}`} />
            <span className="text-[10px] mt-1 tracking-tight leading-none">{item.label}</span>
          </button>
        );
      })}

      <button
        onClick={toggleSidebar}
        className="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 py-1 rounded-xl text-slate-400 hover:text-cyan-300 transition-all"
        title="More Options"
      >
        <Menu className="w-5 h-5 text-slate-400" />
        <span className="text-[10px] mt-1 tracking-tight leading-none">Menu</span>
      </button>
    </div>
  );
};
