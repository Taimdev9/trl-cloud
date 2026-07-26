import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { BotTemplate } from '../types';
import { Shield, Music, Coins, Terminal, Loader2, CheckCircle2 } from 'lucide-react';

interface BotTemplatesPageProps {
  setActiveTab: (tab: string) => void;
  setSelectedBotId: (id: string) => void;
}

export const BotTemplatesPage: React.FC<BotTemplatesPageProps> = ({ setActiveTab, setSelectedBotId }) => {
  const { getAuthHeader } = useAuth();
  const { t } = useLanguage();

  const [templates, setTemplates] = useState<BotTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [deployingId, setDeployingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/templates')
      .then(res => res.json())
      .then(data => setTemplates(data.templates || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleDeployTemplate = async (template: BotTemplate) => {
    setDeployingId(template.id);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({
          name: template.name,
          description: template.description,
          language: template.language,
          files: template.files,
          mainFile: template.mainFile
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedBotId(data.project.id);
        setActiveTab('bot-detail');
      }
    } catch (err) {
      console.error('Failed to deploy template:', err);
    } finally {
      setDeployingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <h1 className="text-2xl font-extrabold text-white">{t('templatesTitle')}</h1>
        <p className="text-xs text-slate-400">{t('templatesSubtitle')}</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
          <span>Loading bot templates gallery...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="p-6 rounded-3xl bg-[#0f1117] border border-indigo-500/15 hover:border-indigo-500/35 transition-all flex flex-col justify-between space-y-6 shadow-xl"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                  {tpl.icon === 'Shield' ? <Shield className="w-6 h-6" /> : tpl.icon === 'Music' ? <Music className="w-6 h-6" /> : <Coins className="w-6 h-6" />}
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-white">{tpl.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{tpl.description}</p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {tpl.tags.map((tag, i) => (
                    <span key={i} className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-semibold">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleDeployTemplate(tpl)}
                disabled={deployingId === tpl.id}
                className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
              >
                {deployingId === tpl.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Terminal className="w-4 h-4" />}
                <span>{t('deployTemplate')}</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
