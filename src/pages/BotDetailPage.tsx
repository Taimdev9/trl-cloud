import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { BotProject, LogEntry, EnvVariable } from '../types';
import { 
  Play, 
  Square, 
  RotateCw, 
  Terminal, 
  Code2, 
  Key, 
  Plus, 
  Trash2, 
  Save, 
  Search, 
  Trash, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  HardDrive, 
  Clock, 
  Send
} from 'lucide-react';

interface BotDetailPageProps {
  botId: string;
  setActiveTab: (tab: string) => void;
}

export const BotDetailPage: React.FC<BotDetailPageProps> = ({ botId, setActiveTab }) => {
  const { getAuthHeader } = useAuth();
  const { t } = useLanguage();

  const [project, setProject] = useState<BotProject | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [envVars, setEnvVars] = useState<EnvVariable[]>([]);
  const [logSearch, setLogSearch] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [cmdInput, setCmdInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingEnv, setSavingEnv] = useState(false);
  const [envSaveMsg, setEnvSaveMsg] = useState<string | null>(null);

  const logsEndRef = useRef<HTMLDivElement>(null);

  const fetchBotDetails = async () => {
    try {
      const res = await fetch(`/api/projects/${botId}`, { headers: getAuthHeader() });
      if (res.ok) {
        const data = await res.json();
        setProject(data.project);
        if (data.project.envVars) {
          setEnvVars(data.project.envVars);
        }
      }
    } catch (err) {
      console.error('Failed to fetch bot details:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch(`/api/projects/${botId}/logs`, { headers: getAuthHeader() });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    }
  };

  useEffect(() => {
    fetchBotDetails();
    fetchLogs();
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, [botId]);

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const handleBotAction = async (action: 'start' | 'stop' | 'restart') => {
    try {
      await fetch(`/api/projects/${botId}/${action}`, {
        method: 'POST',
        headers: getAuthHeader()
      });
      fetchBotDetails();
      fetchLogs();
    } catch (err) {
      console.error(`Failed to ${action} bot:`, err);
    }
  };

  const handleClearLogs = async () => {
    try {
      await fetch(`/api/projects/${botId}/logs/clear`, {
        method: 'POST',
        headers: getAuthHeader()
      });
      setLogs([]);
    } catch (err) {
      console.error('Failed to clear logs:', err);
    }
  };

  const handleTerminalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmdInput.trim()) return;

    const cmd = cmdInput.trim();
    setCmdInput('');

    try {
      await fetch(`/api/projects/${botId}/terminal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ command: cmd })
      });
      fetchLogs();
    } catch (err) {
      console.error('Failed to execute terminal command:', err);
    }
  };

  const handleAddEnv = () => {
    setEnvVars(prev => [...prev, { key: '', value: '' }]);
  };

  const handleRemoveEnv = (index: number) => {
    setEnvVars(prev => prev.filter((_, i) => i !== index));
  };

  const handleEnvChange = (index: number, field: 'key' | 'value', val: string) => {
    setEnvVars(prev => {
      const updated = [...prev];
      updated[index][field] = val;
      return updated;
    });
  };

  const handleSaveEnv = async () => {
    setSavingEnv(true);
    setEnvSaveMsg(null);
    try {
      const res = await fetch(`/api/projects/${botId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ envVars })
      });

      if (res.ok) {
        setEnvSaveMsg(t('botSavedSuccess'));
        setTimeout(() => setEnvSaveMsg(null), 3000);
      }
    } catch (err) {
      console.error('Failed to save environment variables:', err);
    } finally {
      setSavingEnv(false);
    }
  };

  const filteredLogs = logs.filter(l => l.message.toLowerCase().includes(logSearch.toLowerCase()));

  if (loading || !project) {
    return (
      <div className="p-12 text-center text-xs text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
        <span>Loading bot details...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('bots')}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">{project.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                project.status === 'online' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
              }`}>
                {project.status}
              </span>
            </div>
            <p className="text-xs text-slate-400">{project.description}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {project.status === 'online' ? (
            <button
              onClick={() => handleBotAction('stop')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 flex items-center gap-1.5 transition-colors"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>{t('btnStop')}</span>
            </button>
          ) : (
            <button
              onClick={() => handleBotAction('start')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 flex items-center gap-1.5 transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{t('btnStart')}</span>
            </button>
          )}

          <button
            onClick={() => handleBotAction('restart')}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>{t('btnRestart')}</span>
          </button>

          <button
            onClick={() => setActiveTab('editor')}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-colors"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{t('btnEditCode')}</span>
          </button>
        </div>
      </div>

      {/* Resource Meters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#0f1117] border border-indigo-500/15 flex items-center gap-3">
          <Cpu className="w-5 h-5 text-indigo-400" />
          <div>
            <p className="text-[11px] text-slate-400">{t('cpu')}</p>
            <p className="text-base font-extrabold text-white">{project.cpuUsage}%</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f1117] border border-indigo-500/15 flex items-center gap-3">
          <HardDrive className="w-5 h-5 text-purple-400" />
          <div>
            <p className="text-[11px] text-slate-400">{t('ram')}</p>
            <p className="text-base font-extrabold text-white">{project.memoryUsage} MB / 512 MB</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f1117] border border-indigo-500/15 flex items-center gap-3">
          <Clock className="w-5 h-5 text-blue-400" />
          <div>
            <p className="text-[11px] text-slate-400">{t('uptime')}</p>
            <p className="text-base font-extrabold text-white">
              {Math.floor(project.uptimeSeconds / 3600)}h {Math.floor((project.uptimeSeconds % 3600) / 60)}m
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Console Terminal & Environment Secrets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Terminal Live Console (2 columns) */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-[#08090d] border border-indigo-500/20 shadow-2xl flex flex-col h-[520px]">
          
          {/* Terminal Header */}
          <div className="pb-3 mb-3 border-b border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="font-extrabold text-xs text-white">{t('liveConsole')}</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3 h-3 text-slate-500 absolute left-2.5 top-2" />
                <input
                  type="text"
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  placeholder="Search logs..."
                  className="pl-8 pr-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-white focus:outline-none w-32 sm:w-40"
                />
              </div>

              <button
                onClick={handleClearLogs}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-colors"
                title={t('clearLogs')}
              >
                <Trash className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Console Log Area */}
          <div className="flex-1 overflow-y-auto font-mono text-[11px] space-y-1.5 p-3 rounded-xl bg-[#050608] border border-slate-900 leading-relaxed">
            {filteredLogs.length === 0 ? (
              <div className="text-slate-600 text-center py-12">
                No logs generated yet. Click "Start Bot" to boot container.
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-2">
                  <span className="text-slate-600 shrink-0 text-[10px]">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className={`break-all ${
                    log.type === 'error' ? 'text-red-400 font-bold' :
                    log.type === 'warn' ? 'text-amber-400' :
                    log.type === 'success' ? 'text-emerald-400' :
                    log.type === 'system' ? 'text-indigo-400 font-semibold' : 'text-slate-200'
                  }`}>
                    {log.message}
                  </span>
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>

          {/* Console Input Bar */}
          <form onSubmit={handleTerminalSubmit} className="mt-3 flex items-center gap-2">
            <span className="text-emerald-400 font-mono text-xs font-bold pl-1">$</span>
            <input
              type="text"
              value={cmdInput}
              onChange={(e) => setCmdInput(e.target.value)}
              placeholder="Execute command (e.g. npm install discord.js)..."
              className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>

        {/* Environment Variables Panel */}
        <div className="p-5 rounded-3xl bg-[#0f1117] border border-indigo-500/20 shadow-2xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <span className="font-extrabold text-xs text-white">Environment Secrets (.env)</span>
              </div>
              <button
                onClick={handleAddEnv}
                className="p-1 rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/40 transition-colors"
                title={t('addEnvVar')}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {envSaveMsg && (
              <div className="p-2.5 mb-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{envSaveMsg}</span>
              </div>
            )}

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {envVars.map((env, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={env.key}
                    onChange={(e) => handleEnvChange(i, 'key', e.target.value)}
                    placeholder="BOT_TOKEN"
                    className="w-1/2 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-amber-300 font-mono focus:outline-none"
                  />
                  <input
                    type="password"
                    value={env.value}
                    onChange={(e) => handleEnvChange(i, 'value', e.target.value)}
                    placeholder="value"
                    className="w-1/2 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none"
                  />
                  <button
                    onClick={() => handleRemoveEnv(i)}
                    className="p-1.5 text-slate-500 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleSaveEnv}
            disabled={savingEnv}
            className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            {savingEnv ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{t('saveEnvVars')}</span>
          </button>
        </div>

      </div>

    </div>
  );
};
