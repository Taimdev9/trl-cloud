import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LogOut, Loader2, CheckCircle, ExternalLink, Sparkles } from 'lucide-react';

export const DiscordSection: React.FC = () => {
  const { user, connectDiscord, disconnectDiscord } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      await connectDiscord();
    } catch (err: any) {
      setError(err.message || 'Failed to connect Discord account.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect your Discord account?')) return;
    setLoading(true);
    setError(null);
    try {
      const res = await disconnectDiscord();
      if (!res.success) {
        setError(res.error || 'Failed to disconnect account.');
      }
    } catch (err: any) {
      setError(err.message || 'Error disconnecting account.');
    } finally {
      setLoading(false);
    }
  };

  const isConnected = !!user?.discord;

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-[#0f1117] border border-[#5865F2]/30 shadow-2xl space-y-5 relative overflow-hidden">
      
      {/* Background Subtle Gradient Glow */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-[#5865F2]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#5865F2] flex items-center justify-center text-white shadow-lg shadow-[#5865F2]/30 shrink-0">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 127.14 96.36">
              <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a73.51,73.51,0,0,0,64.32,0c.87.68,1.75,1.36,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1,105.25,105.25,0,0,0,32.19-16.14c2.64-27.38-4.51-51.11-18.91-72.15ZM42.45,65.69C36.18,65.69,31,60,31,53S36,40.3,42.45,40.3C48.92,40.3,54,46,53.87,53,53.87,60,48.82,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5.06-12.7,11.44-12.7C91.18,40.3,96.25,46,96.12,53,96.12,60,91.08,65.69,84.69,65.69Z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <span>Discord OAuth2 Integration</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#5865F2]/20 text-[#818cf8] border border-[#5865F2]/30 uppercase tracking-wider">
                TRL Cloud Sync
              </span>
            </h3>
            <p className="text-xs text-slate-400">Manage connected Discord account & bot ownership authorization</p>
          </div>
        </div>

        {/* Status Pill */}
        <div className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 shrink-0 ${
          isConnected
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span>{isConnected ? 'Account Connected' : 'Not Connected'}</span>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/30 text-red-300 text-xs">
          {error}
        </div>
      )}

      {/* Account Info Content */}
      {isConnected && user?.discord ? (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={user.discord.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'}
                alt={user.discord.username}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-[#5865F2] shadow-md shadow-[#5865F2]/20"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900" title="Online" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-white">
                  {user.discord.globalName || user.discord.username}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  @{user.discord.username}
                </span>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Discord ID: <strong className="text-slate-300 font-mono">{user.discord.id}</strong></span>
                </span>
                <span>•</span>
                <span>Connected: {new Date(user.discord.connectedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleDisconnect}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-all flex items-center gap-2 shrink-0"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
            <span>Disconnect Discord Account</span>
          </button>
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-lg">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Connect Your Discord Account</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Link your Discord profile to authorize bot commands, sync developer roles, and enable instant Discord OAuth2 single sign-on.
            </p>
          </div>

          <button
            onClick={handleConnect}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-[#5865F2] hover:bg-[#4752C4] shadow-lg shadow-[#5865F2]/25 transition-all flex items-center gap-2 shrink-0"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 127.14 96.36">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a73.51,73.51,0,0,0,64.32,0c.87.68,1.75,1.36,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1,105.25,105.25,0,0,0,32.19-16.14c2.64-27.38-4.51-51.11-18.91-72.15ZM42.45,65.69C36.18,65.69,31,60,31,53S36,40.3,42.45,40.3C48.92,40.3,54,46,53.87,53,53.87,60,48.82,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5.06-12.7,11.44-12.7C91.18,40.3,96.25,46,96.12,53,96.12,60,91.08,65.69,84.69,65.69Z" />
              </svg>
            )}
            <span>Connect Discord Account</span>
          </button>
        </div>
      )}

    </div>
  );
};
