import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { BotLanguage, BotFile } from '../types';
import JSZip from 'jszip';
import { 
  X, 
  FileArchive, 
  UploadCloud, 
  Code2, 
  Github, 
  Check, 
  AlertCircle, 
  Loader2, 
  FolderPlus,
  Terminal
} from 'lucide-react';

interface CreateBotModalProps {
  onClose: () => void;
  onCreated: (projectId: string) => void;
}

export const CreateBotModal: React.FC<CreateBotModalProps> = ({ onClose, onCreated }) => {
  const { t } = useLanguage();
  const { getAuthHeader } = useAuth();

  const [activeTab, setActiveTab] = useState<'zip' | 'manual' | 'scratch' | 'github'>('zip');
  const [botName, setBotName] = useState('');
  const [botDesc, setBotDesc] = useState('');
  const [botLang, setBotLang] = useState<BotLanguage>('nodejs');
  const [githubUrl, setGithubUrl] = useState('');
  
  // File upload state
  const [parsedFiles, setParsedFiles] = useState<BotFile[]>([]);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState(`// Discord bot starter code
console.log("Starting Discord bot...");
`);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ZIP File Handler
  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    setLoading(true);
    setError(null);

    try {
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(file);
      const extractedFiles: BotFile[] = [];

      let detectedLang: BotLanguage = 'nodejs';

      for (const [filename, fileObj] of Object.entries(zipContent.files)) {
        if (!fileObj.dir) {
          const content = await fileObj.async('string');
          extractedFiles.push({
            path: filename,
            content
          });

          if (filename.endsWith('requirements.txt') || filename.endsWith('.py')) {
            detectedLang = 'python';
          } else if (filename.endsWith('package.json') || filename.endsWith('.js') || filename.endsWith('.ts')) {
            detectedLang = 'nodejs';
          }
        }
      }

      setParsedFiles(extractedFiles);
      setBotLang(detectedLang);

      // Default name from ZIP if empty
      if (!botName) {
        setBotName(file.name.replace(/\.zip$/i, '').replace(/[^a-zA-Z0-9_-]/g, ' '));
      }
    } catch (err: any) {
      setError('Failed to extract .zip file: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Manual File Upload Handler
  const handleManualFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    const extractedFiles: BotFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const text = await f.text();
      extractedFiles.push({
        path: f.name,
        content: text
      });
    }

    setParsedFiles(extractedFiles);
    setLoading(false);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!botName.trim()) {
      setError('Bot name is required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let finalFiles: BotFile[] = [];
      let mainFile = botLang === 'python' ? 'main.py' : 'index.js';

      if (activeTab === 'zip' || activeTab === 'manual') {
        finalFiles = parsedFiles;
        if (finalFiles.some(f => f.path.endsWith('main.py'))) mainFile = 'main.py';
        if (finalFiles.some(f => f.path.endsWith('index.js'))) mainFile = 'index.js';
      } else if (activeTab === 'scratch') {
        if (botLang === 'nodejs') {
          finalFiles = [
            { path: 'index.js', content: manualCode },
            { 
              path: 'package.json', 
              content: JSON.stringify({ 
                name: botName.toLowerCase().replace(/\s+/g, '-'), 
                version: '1.0.0', 
                main: 'index.js',
                dependencies: { 'discord.js': '^14.14.1', 'dotenv': '^16.4.5' } 
              }, null, 2) 
            },
            { path: '.env', content: 'BOT_TOKEN=YOUR_DISCORD_BOT_TOKEN_HERE\n' }
          ];
          mainFile = 'index.js';
        } else {
          finalFiles = [
            { path: 'main.py', content: manualCode },
            { path: 'requirements.txt', content: 'discord.py==2.3.2\npython-dotenv==1.0.1\n' },
            { path: '.env', content: 'BOT_TOKEN=YOUR_DISCORD_BOT_TOKEN_HERE\n' }
          ];
          mainFile = 'main.py';
        }
      } else if (activeTab === 'github') {
        // GitHub import simulation fetching template or repo
        finalFiles = [
          {
            path: botLang === 'python' ? 'main.py' : 'index.js',
            content: `// Imported from GitHub repo: ${githubUrl}\n// Hosted on TRL Cloud\nconsole.log("GitHub Bot initialized!");`
          },
          {
            path: botLang === 'python' ? 'requirements.txt' : 'package.json',
            content: botLang === 'python' ? 'discord.py\npython-dotenv' : '{"name": "github-imported-bot", "main": "index.js", "dependencies": {"discord.js": "^14.14.1"}}'
          }
        ];
      }

      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({
          name: botName,
          description: botDesc,
          language: botLang,
          files: finalFiles,
          mainFile,
          gitRepoUrl: githubUrl || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create bot project');
      }

      onCreated(data.project.id);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#0f1117] border border-indigo-500/25 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-b border-indigo-500/15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">{t('createBotTitle')}</h2>
              <p className="text-xs text-slate-400">Select how you want to add your Discord bot code</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation (4 Creation Methods) */}
        <div className="p-2 bg-slate-950 border-b border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('zip')}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'zip'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <FileArchive className="w-3.5 h-3.5" />
            <span>{t('tabZipUpload')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'manual'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>{t('tabManualUpload')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('scratch')}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'scratch'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{t('tabCodeEditor')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('github')}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'github'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Github className="w-3.5 h-3.5" />
            <span>{t('tabGitImport')}</span>
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Project Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {t('botNameLabel')} <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                placeholder={t('botNamePlaceholder')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {t('botLangLabel')}
              </label>
              <select
                value={botLang}
                onChange={(e) => setBotLang(e.target.value as BotLanguage)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="nodejs">JavaScript (Node.js - Discord.js)</option>
                <option value="python">Python (discord.py)</option>
                <option value="java" disabled>Java (Coming Soon)</option>
                <option value="csharp" disabled>C# (Coming Soon)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              {t('botDescLabel')}
            </label>
            <input
              type="text"
              value={botDesc}
              onChange={(e) => setBotDesc(e.target.value)}
              placeholder={t('botDescPlaceholder')}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Tab Specific Input Fields */}
          {activeTab === 'zip' && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                {t('selectZipFile')}
              </label>
              <div className="relative border-2 border-dashed border-indigo-500/30 hover:border-indigo-500/60 rounded-2xl p-6 text-center bg-indigo-950/10 transition-colors">
                <input
                  type="file"
                  accept=".zip"
                  onChange={handleZipUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <FileArchive className="w-10 h-10 text-indigo-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-200">{t('dragDropZip')}</p>
                {selectedFileName ? (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{selectedFileName} ({parsedFiles.length} files found)</span>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 mt-1">Supports Node.js & Python Discord bot archives</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'manual' && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                Upload Bot Source Files
              </label>
              <div className="relative border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-2xl p-6 text-center bg-slate-900/40">
                <input
                  type="file"
                  multiple
                  onChange={handleManualFiles}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <UploadCloud className="w-10 h-10 text-indigo-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-200">Select index.js, main.py, package.json, or .env files</p>
                <p className="text-[11px] text-slate-500 mt-1">{parsedFiles.length} files selected</p>
              </div>
            </div>
          )}

          {activeTab === 'scratch' && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                Initial Starter Code ({botLang === 'python' ? 'main.py' : 'index.js'})
              </label>
              <textarea
                rows={6}
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="w-full font-mono text-xs p-3 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>
          )}

          {activeTab === 'github' && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                {t('githubUrlLabel')}
              </label>
              <div className="relative">
                <Github className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder={t('githubUrlPlaceholder')}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <p className="text-[11px] text-slate-500">TRL Cloud will pull the repository and detect project structure automatically.</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/30 flex items-center gap-2 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('creatingBot')}</span>
                </>
              ) : (
                <>
                  <Terminal className="w-4 h-4" />
                  <span>{t('btnCreateBot')}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
