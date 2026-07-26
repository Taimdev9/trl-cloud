import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { BotProject } from '../types';
import { 
  Bot, 
  Play, 
  Square, 
  RotateCw, 
  Code2, 
  PlusCircle, 
  Search, 
  Terminal, 
  Trash2, 
  Edit3, 
  Loader2, 
  Check, 
  X,
  AlertTriangle
} from 'lucide-react';

interface BotsPageProps {
  setActiveTab: (tab: string) => void;
  setSelectedBotId: (id: string) => void;
  onOpenCreateModal: () => void;
}

export const BotsPage: React.FC<BotsPageProps> = ({ setActiveTab, setSelectedBotId, onOpenCreateModal }) => {
  const { getAuthHeader } = useAuth();
  const { t } = useLanguage();

  const [projects, setProjects] = useState<BotProject[]>([]);
  const [search, setSearch] = useState('');
  const [langFilter, setLangFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Rename state
  const [editingBotId, setEditingBotId] = useState<string | null>(null);
  const [renameText, setRenameText] = useState('');

  const fetchBots = async () => {
    try {
      const res = await fetch('/api/projects', { headers: getAuthHeader() });
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error('Failed to fetch bots:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBots();
  }, []);

  const handleBotAction = async (id: string, action: 'start' | 'stop' | 'restart') => {
    try {
      await fetch(`/api/projects/${id}/${action}`, {
        method: 'POST',
        headers: getAuthHeader()
      });
      fetchBots();
    } catch (err) {
      console.error(`Failed to ${action} bot:`, err);
    }
  };

  const handleRename = async (id: string) => {
    if (!renameText.trim()) return;
    try {
      await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ name: renameText })
      });
      setEditingBotId(null);
      fetchBots();
    } catch (err) {
      console.error('Failed to rename bot:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('confirmDelete'))) return;

    try {
      await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });
      fetchBots();
    } catch (err) {
      console.error('Failed to delete bot:', err);
    }
  };

  const filteredBots = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    const matchesLang = langFilter === 'all' || p.language === langFilter;
    return matchesSearch && matchesLang;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">{t('navMyBots')}</h1>
          <p className="text-xs text-slate-400">Manage and host your Node.js and Python Discord bot instances</p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('createBotTitle')}</span>
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bots by name or description..."
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <select
          value={langFilter}
          onChange={(e) => setLangFilter(e.target.value)}
          className="w-full sm:w-48 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors"
        >
          <option value="all">All Languages</option>
          <option value="nodejs">JavaScript (Node.js)</option>
          <option value="python">Python</option>
        </select>
      </div>

      {/* Bots Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
          <span>Loading Discord bots...</span>
        </div>
      ) : filteredBots.length === 0 ? (
        <div className="p-10 rounded-3xl bg-[#0f1117] border border-slate-800 text-center space-y-3">
          <Bot className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-bold text-slate-300">No Bots Found</p>
          <p className="text-xs text-slate-500">Try adjusting your search filter or create a new Discord bot.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBots.map((bot) => (
            <div
              key={bot.id}
              className="p-5 rounded-2xl bg-[#0f1117] border border-indigo-500/15 hover:border-indigo-500/30 transition-all space-y-4 flex flex-col justify-between"
            >
              <div>
                {/* Header Title & Status */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  
                  <div className="flex-1">
                    {editingBotId === bot.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={renameText}
                          onChange={(e) => setRenameText(e.target.value)}
                          className="px-2 py-1 rounded bg-slate-900 border border-indigo-500 text-xs text-white focus:outline-none"
                        />
                        <button onClick={() => handleRename(bot.id)} className="p-1 text-emerald-400 hover:bg-slate-800 rounded">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setEditingBotId(null)} className="p-1 text-slate-400 hover:bg-slate-800 rounded">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h3 
                          onClick={() => { setSelectedBotId(bot.id); setActiveTab('bot-detail'); }}
                          className="font-extrabold text-sm text-white hover:text-indigo-400 cursor-pointer transition-colors truncate"
                        >
                          {bot.name}
                        </h3>
                        <button 
                          onClick={() => { setEditingBotId(bot.id); setRenameText(bot.name); }}
                          className="text-slate-500 hover:text-slate-300" 
                          title="Rename Bot"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{bot.description}</p>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                    bot.status === 'online'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {bot.status}
                  </span>
                </div>

                {/* Tech Badges */}
                <div className="flex items-center gap-2 pt-2 text-[10px] font-bold">
                  <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                    {bot.language === 'python' ? '🐍 Python' : '⚡ Node.js'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                    Main: {bot.mainFile}
                  </span>
                </div>
              </div>

              {/* Bot Control Panel Bar */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {bot.status === 'online' ? (
                    <button
                      onClick={() => handleBotAction(bot.id, 'stop')}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 flex items-center gap-1 transition-colors"
                    >
                      <Square className="w-3 h-3 fill-current" />
                      <span>Stop</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBotAction(bot.id, 'start')}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 flex items-center gap-1 transition-colors"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Start</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleBotAction(bot.id, 'restart')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Restart"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setSelectedBotId(bot.id); setActiveTab('bot-detail'); }}
                    className="p-2 rounded-lg text-indigo-400 hover:bg-indigo-950/40 transition-colors"
                    title="Open Live Console"
                  >
                    <Terminal className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => { setSelectedBotId(bot.id); setActiveTab('editor'); }}
                    className="p-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
                    title="Open Code IDE"
                  >
                    <Code2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(bot.id)}
                    className="p-2 rounded-lg text-red-400 hover:bg-red-950/30 transition-colors"
                    title="Delete Bot"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
