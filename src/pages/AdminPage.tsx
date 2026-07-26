import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ShieldAlert, Users, Bot, Activity, Ban, CheckCircle2, Square, Loader2 } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { getAuthHeader } = useAuth();
  const { t } = useLanguage();

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const res = await fetch('/api/admin/stats', { headers: getAuthHeader() });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleBan = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'PUT',
        headers: getAuthHeader()
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to toggle ban:', err);
    }
  };

  const handleForceStopBot = async (projectId: string) => {
    try {
      await fetch(`/api/projects/${projectId}/stop`, {
        method: 'POST',
        headers: getAuthHeader()
      });
      fetchAdminData();
    } catch (err) {
      console.error('Failed to force stop bot:', err);
    }
  };

  if (loading || !stats) {
    return (
      <div className="p-12 text-center text-xs text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
        <span>Loading TRL Cloud Admin Panel...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      
      {/* Title Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-white">{t('adminTitle')}</h1>
          <p className="text-xs text-slate-400">Global user accounts, bot moderation, and server metrics</p>
        </div>
      </div>

      {/* Admin Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0f1117] border border-amber-500/20 shadow-xl">
          <p className="text-xs text-slate-400 font-medium">{t('totalUsers')}</p>
          <p className="text-2xl font-black text-white mt-1">{stats.totalUsers}</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f1117] border border-amber-500/20 shadow-xl">
          <p className="text-xs text-slate-400 font-medium">Total Projects</p>
          <p className="text-2xl font-black text-white mt-1">{stats.totalBots}</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f1117] border border-amber-500/20 shadow-xl">
          <p className="text-xs text-slate-400 font-medium">{t('activeBots')}</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">{stats.activeBots}</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f1117] border border-amber-500/20 shadow-xl">
          <p className="text-xs text-slate-400 font-medium">Support Tickets</p>
          <p className="text-2xl font-black text-purple-400 mt-1">{stats.tickets}</p>
        </div>
      </div>

      {/* User Directory Table */}
      <div className="p-6 rounded-3xl bg-[#0f1117] border border-indigo-500/20 space-y-4">
        <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-400" />
          <span>{t('manageUsers')}</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3 font-bold">Username</th>
                <th className="p-3 font-bold">Email</th>
                <th className="p-3 font-bold">{t('role')}</th>
                <th className="p-3 font-bold">Status</th>
                <th className="p-3 font-bold text-right">{t('action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {stats.users.map((u: any) => (
                <tr key={u.id} className="hover:bg-slate-900/40">
                  <td className="p-3 font-bold text-white">{u.username}</td>
                  <td className="p-3 text-slate-400">{u.email}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      u.role === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3">
                    {u.isBanned ? (
                      <span className="text-red-400 font-bold">Banned</span>
                    ) : (
                      <span className="text-emerald-400">Active</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => handleToggleBan(u.id)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                          u.isBanned
                            ? 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40'
                            : 'bg-red-600/20 text-red-400 hover:bg-red-600/40'
                        }`}
                      >
                        {u.isBanned ? t('unbanUser') : t('banUser')}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Global Bot Projects Inspector */}
      <div className="p-6 rounded-3xl bg-[#0f1117] border border-indigo-500/20 space-y-4">
        <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
          <Bot className="w-4 h-4 text-indigo-400" />
          <span>{t('manageProjects')}</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3 font-bold">Bot Name</th>
                <th className="p-3 font-bold">Language</th>
                <th className="p-3 font-bold">Status</th>
                <th className="p-3 font-bold">Memory</th>
                <th className="p-3 font-bold text-right">{t('action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {stats.projects.map((p: any) => (
                <tr key={p.id} className="hover:bg-slate-900/40">
                  <td className="p-3 font-bold text-white">{p.name}</td>
                  <td className="p-3 text-slate-400 uppercase font-mono">{p.language}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      p.status === 'online' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300">{p.memoryUsage} MB</td>
                  <td className="p-3 text-right">
                    {p.status === 'online' && (
                      <button
                        onClick={() => handleForceStopBot(p.id)}
                        className="px-3 py-1 rounded-lg text-[11px] font-bold bg-red-600/20 text-red-400 hover:bg-red-600/40 transition-colors"
                      >
                        {t('forceStop')}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
