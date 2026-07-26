import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { BookOpen, Terminal, Key, FileArchive, Github, Shield, Layers } from 'lucide-react';

export const DocsPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-white">{t('navDocs')}</h1>
        <p className="text-xs text-slate-400">Complete developer guide for hosting Discord bots on TRL Cloud</p>
      </div>

      <div className="space-y-6 text-slate-300 text-xs leading-relaxed">
        
        {/* Step 1 */}
        <div className="p-6 rounded-3xl bg-[#0f1117] border border-indigo-500/20 space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
            <Key className="w-4 h-4" />
            <span>1. Getting Your Discord Bot Token</span>
          </div>
          <ol className="list-decimal list-inside space-y-1.5 text-slate-400">
            <li>Go to the official Discord Developer Portal: <a href="https://discord.com/developers/applications" target="_blank" rel="noreferrer" className="text-indigo-400 underline">discord.com/developers/applications</a></li>
            <li>Click <strong>New Application</strong> and give your bot a name.</li>
            <li>In the left sidebar, click <strong>Bot</strong>, then click <strong>Reset Token</strong> to copy your secret token.</li>
            <li>Enable <strong>Message Content Intent</strong> and <strong>Server Members Intent</strong> under Privileged Gateway Intents.</li>
            <li>Paste your token in TRL Cloud Environment Variables under <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">BOT_TOKEN</code>.</li>
          </ol>
        </div>

        {/* Step 2 */}
        <div className="p-6 rounded-3xl bg-[#0f1117] border border-indigo-500/20 space-y-3">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
            <FileArchive className="w-4 h-4" />
            <span>2. Uploading a .ZIP Project File</span>
          </div>
          <p className="text-slate-400">
            Compress your bot code directory into a standard <code className="text-indigo-300 bg-slate-900 px-1 py-0.5 rounded">.zip</code> archive.
            Ensure your root directory contains either <code className="text-indigo-300 bg-slate-900 px-1 py-0.5 rounded">package.json</code> (for Node.js) or <code className="text-indigo-300 bg-slate-900 px-1 py-0.5 rounded">requirements.txt</code> (for Python).
          </p>
        </div>

        {/* Step 3 */}
        <div className="p-6 rounded-3xl bg-[#0f1117] border border-indigo-500/20 space-y-3">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
            <Github className="w-4 h-4" />
            <span>3. Importing from GitHub</span>
          </div>
          <p className="text-slate-400">
            Copy your GitHub repository URL (e.g., <code className="text-indigo-300 bg-slate-900 px-1 py-0.5 rounded">https://github.com/user/discord-bot</code>) and paste it into the GitHub Import tab when creating a bot. TRL Cloud will clone and prepare the execution container automatically.
          </p>
        </div>

        {/* Step 4 */}
        <div className="p-6 rounded-3xl bg-[#0f1117] border border-indigo-500/20 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <Terminal className="w-4 h-4" />
            <span>4. Using the Online Code IDE</span>
          </div>
          <p className="text-slate-400">
            Open the <strong>Code Editor</strong> tab at any time to create new files, edit existing source files, or execute terminal commands like <code className="text-emerald-300 bg-slate-900 px-1 py-0.5 rounded">npm install package_name</code> directly from your browser.
          </p>
        </div>

      </div>

    </div>
  );
};
