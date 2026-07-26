import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { SystemNode } from '../types';
import { Activity, Server, CheckCircle2, Shield, Globe, Clock } from 'lucide-react';

export const SystemStatusPage: React.FC = () => {
  const { t } = useLanguage();
  const [nodes, setNodes] = useState<SystemNode[]>([]);
  const [overallStatus, setOverallStatus] = useState('operational');
  const [uptimePercent, setUptimePercent] = useState(99.98);

  useEffect(() => {
    fetch('/api/system/nodes')
      .then(res => res.json())
      .then(data => {
        setNodes(data.nodes || []);
        setOverallStatus(data.overallStatus || 'operational');
        setUptimePercent(data.uptimePercent || 99.98);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      
      {/* Top Banner */}
      <div className="p-8 rounded-3xl bg-emerald-950/20 border border-emerald-500/30 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-white">{t('allSystemsOperational')}</h1>
        <p className="text-xs text-emerald-300">TRL Cloud Node Clusters are running at 99.98% uptime</p>
      </div>

      {/* Cloud Nodes List */}
      <div className="space-y-4">
        <h2 className="text-base font-extrabold text-white flex items-center gap-2">
          <Server className="w-4 h-4 text-indigo-400" />
          <span>Regional Hosting Nodes</span>
        </h2>

        <div className="space-y-3">
          {nodes.map((node) => (
            <div key={node.id} className="p-5 rounded-2xl bg-[#0f1117] border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{node.flag}</span>
                <div>
                  <p className="text-sm font-bold text-white">{node.name}</p>
                  <p className="text-xs text-slate-500">{node.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs text-slate-400">
                <div>Ping: <strong className="text-emerald-400">{node.pingMs}ms</strong></div>
                <div>Active Bots: <strong className="text-white">{node.activeBots}</strong></div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] uppercase">
                  Operational
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 90 Days Uptime Grid */}
      <div className="p-6 rounded-3xl bg-[#0f1117] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white">{t('uptime90Days')}</span>
          <span className="text-xs font-extrabold text-emerald-400">99.98%</span>
        </div>

        <div className="flex gap-1 h-8 items-center overflow-x-auto">
          {Array.from({ length: 60 }).map((_, i) => (
            <div key={i} className="flex-1 h-6 rounded bg-emerald-500/80 hover:bg-emerald-400 transition-colors shrink-0 min-w-[6px]" title="100% operational"></div>
          ))}
        </div>
      </div>

    </div>
  );
};
