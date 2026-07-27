import React from 'react';
import { Server, Cpu } from 'lucide-react';

export const PageLoading: React.FC<{ message?: string }> = ({ message = 'Loading TRL Cloud modules...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center space-y-6 animate-fade-in">
      {/* Animated Server Node Graphic */}
      <div className="relative">
        <div className="w-20 h-20 rounded-3xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center shadow-2xl shadow-indigo-500/20 relative z-10">
          <Server className="w-10 h-10 text-indigo-400 animate-pulse" />
        </div>
        
        {/* Outer Orbit Rings */}
        <div className="absolute inset-0 -m-3 border-2 border-indigo-500/30 border-t-indigo-400 rounded-3xl animate-spin-slow" />
        <div className="absolute inset-0 -m-6 border border-purple-500/20 border-b-purple-400 rounded-full animate-spin" />
      </div>

      <div className="space-y-2">
        <h3 className="text-base font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
          <span>TRL Cloud Engine</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </h3>
        <p className="text-xs text-slate-400 font-mono animate-pulse">{message}</p>
      </div>

      {/* Modern Loading Progress Bar */}
      <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
        <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 rounded-full animate-pulse w-3/4" />
      </div>
    </div>
  );
};

export const InitialSplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 1200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-[#08090d] text-white flex flex-col items-center justify-center p-6 space-y-6 select-none animate-fade-in">
      <div className="relative">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-blue-500 flex items-center justify-center shadow-2xl shadow-indigo-500/40 transform transition-transform hover:scale-105">
          <Server className="w-12 h-12 text-white" />
        </div>
        <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-slate-900 border-2 border-indigo-500 flex items-center justify-center">
          <Cpu className="w-4 h-4 text-indigo-400 animate-spin" />
        </div>
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
          TRL CLOUD
        </h1>
        <p className="text-xs text-slate-400 font-mono tracking-wider uppercase">
          Discord Bot Hosting & Developer Suite • V1.4
        </p>
      </div>

      {/* Loading Bar */}
      <div className="w-64 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full animate-[loading_1.2s_ease-in-out_infinite]" />
      </div>

      <div className="text-[11px] text-slate-500 font-mono">
        INITIALIZING CORE SERVICES...
      </div>
    </div>
  );
};
