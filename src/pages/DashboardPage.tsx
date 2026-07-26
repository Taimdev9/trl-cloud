import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { BotProject, SystemNode } from '../types';
import { 
  Bot, 
  Play, 
  Square, 
  RotateCw, 
  Code2, 
  PlusCircle, 
  UploadCloud, 
  Cpu, 
  HardDrive, 
  Activity, 
  Terminal, 
  Box, 
  Trash2, 
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface DashboardPageProps {
  setActiveTab: (tab: string) => void;
  setSelectedBotId: (id: string) => void;
  onOpenCreateModal: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ setActiveTab, setSelectedBotId, onOpenCreateModal }) => {
  const { user, getAuthHeader } = useAuth();
  const { t } = useLanguage();

  const [projects, setProjects] = useState<BotProject[]>([]);
  const [nodes, setNodes] = useState<SystemNode[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [projRes, nodeRes] = await Promise.all([
        fetch('/api/projects', { headers: getAuthHeader() }),
        fetch('/api/system/nodes')
      ]);

      if (projRes.ok) {
        const data = await projRes.json();
        setProjects(data.projects || []);
      }

      if (nodeRes.ok) {
        const data = await nodeRes.json();
        setNodes(data.nodes || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleBotAction = async (id: string, action: 'start' | 'stop' | 'restart') => {
    try {
      const res = await fetch(`/api/projects/${id}/${action}`, {
        method: 'POST',
        headers: getAuthHeader()
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error(`Failed to ${action} bot:`, err);
    }
  };

  const activeBots = projects.filter(p => p.status === 'online').length;
  const totalRam = projects.reduce((acc, p) => acc + p.memoryUsage, 0);

  return (
    <div className="space-y-8 pb-12">
      
      {/* Top Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border border-indigo-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>TRL Cloud Hosting Engine Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Manage your Discord bots, monitor live logs, or code in your browser.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenCreateModal}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('createBotTitle')}</span>
          </button>
          
          <button
            onClick={() => setActiveTab('editor')}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors flex items-center gap-2"
          >
            <Code2 className="w-4 h-4 text-indigo-400" />
            <span>{t('navCodeEditor')}</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="p-5 rounded-2xl bg-[#0f1117] border border-indigo-500/15 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Bot Projects</p>
            <p className="text-2xl font-black text-white mt-1">{projects.length}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f1117] border border-indigo-500/15 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Active Online Bots</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">{activeBots}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f1117] border border-indigo-500/15 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">RAM Allocation</p>
            <p className="text-2xl font-black text-purple-400 mt-1">{totalRam.toFixed(0)} MB</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
            <HardDrive className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f1117] border border-indigo-500/15 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Node Uptime</p>
            <p className="text-2xl font-black text-blue-400 mt-1">99.98%</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
            <Cpu className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Main Bot Projects List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-extrabold text-white">Your Discord Bots</h2>
          </div>
          <button
            onClick={() => setActiveTab('bots')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>View All ({projects.length})</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
            <span>Loading bot projects...</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="p-10 rounded-3xl bg-[#0f1117] border border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">No Discord Bots Created Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Upload a .zip file, import from GitHub, or use our starter templates to deploy your bot on TRL Cloud.
              </p>
            </div>
            <button
              onClick={onOpenCreateModal}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors inline-flex items-center gap-2 shadow-lg shadow-indigo-600/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Your First Bot</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((bot) => (
              <div
                key={bot.id}
                className="p-5 rounded-2xl bg-[#0f1117] border border-indigo-500/15 hover:border-indigo-500/30 transition-all space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 font-bold text-base shrink-0">
                        {bot.language === 'python' ? '🐍' : '⚡'}
                      </div>
                      <div>
                        <h3 
                          onClick={() => { setSelectedBotId(bot.id); setActiveTab('bot-detail'); }}
                          className="font-extrabold text-sm text-white hover:text-indigo-400 cursor-pointer transition-colors"
                        >
                          {bot.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{bot.description}</p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shrink-0 ${
                      bot.status === 'online' 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : bot.status === 'error'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${bot.status === 'online' ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`}></span>
                      <span>{t(`status${bot.status.charAt(0).toUpperCase() + bot.status.slice(1)}` as any)}</span>
                    </span>
                  </div>

                  {/* Resource Usage Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-[11px] text-slate-400">
                    <div>
                      <span>CPU Usage: </span>
                      <strong className="text-white">{bot.cpuUsage}%</strong>
                    </div>
                    <div>
                      <span>RAM Allocation: </span>
                      <strong className="text-white">{bot.memoryUsage} MB</strong>
                    </div>
                  </div>
                </div>

                {/* Control Actions */}
                <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-800/60">
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
                      title="Restart Bot"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setSelectedBotId(bot.id); setActiveTab('bot-detail'); }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/50 transition-colors flex items-center gap-1"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Console</span>
                    </button>

                    <button
                      onClick={() => { setSelectedBotId(bot.id); setActiveTab('editor'); }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800 transition-colors flex items-center gap-1"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cloud Infrastructure Nodes */}
      <div className="space-y-4 pt-4">
        <h2 className="text-base font-extrabold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400" />
          <span>TRL Cloud Infrastructure Nodes</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {nodes.map((node) => (
            <div key={node.id} className="p-4 rounded-2xl bg-[#0f1117] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{node.flag}</span>
                  <div>
                    <p className="text-xs font-bold text-white">{node.name}</p>
                    <p className="text-[10px] text-slate-500">{node.location}</p>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
                <div>Ping: <strong className="text-emerald-400">{node.pingMs}ms</strong></div>
                <div>Hosted Bots: <strong className="text-white">{node.activeBots}</strong></div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
