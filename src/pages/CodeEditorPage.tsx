import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { BotProject, BotFile } from '../types';
import { 
  FileText, 
  FolderPlus, 
  FilePlus, 
  Save, 
  Play, 
  Square, 
  Trash2, 
  Terminal, 
  Loader2, 
  Check, 
  Code2, 
  X,
  ChevronRight,
  Folder
} from 'lucide-react';

interface CodeEditorPageProps {
  botId?: string;
  setActiveTab: (tab: string) => void;
}

export const CodeEditorPage: React.FC<CodeEditorPageProps> = ({ botId, setActiveTab }) => {
  const { getAuthHeader } = useAuth();
  const { t } = useLanguage();

  const [projects, setProjects] = useState<BotProject[]>([]);
  const [selectedBotId, setSelectedBotId] = useState<string>(botId || '');
  const [currentProject, setCurrentProject] = useState<BotProject | null>(null);
  const [activeFilePath, setActiveFilePath] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const [openFiles, setOpenFiles] = useState<string[]>([]);
  const [unsavedChanges, setUnsavedChanges] = useState<Record<string, boolean>>({});

  const [newFileName, setNewFileName] = useState('');
  const [showNewFileModal, setShowNewFileModal] = useState(false);

  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [terminalCmd, setTerminalCmd] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch projects list
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects', { headers: getAuthHeader() });
        if (res.ok) {
          const data = await res.json();
          const list: BotProject[] = data.projects || [];
          setProjects(list);

          if (list.length > 0) {
            const initialId = botId && list.some(p => p.id === botId) ? botId : list[0].id;
            setSelectedBotId(initialId);
          }
        }
      } catch (err) {
        console.error('Failed to load projects for editor:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [botId]);

  // Load selected bot project
  useEffect(() => {
    if (!selectedBotId) return;

    const loadBot = async () => {
      try {
        const res = await fetch(`/api/projects/${selectedBotId}`, { headers: getAuthHeader() });
        if (res.ok) {
          const data = await res.json();
          const proj: BotProject = data.project;
          setCurrentProject(proj);

          if (proj.files && proj.files.length > 0) {
            const mainFile = proj.files.find(f => f.path === proj.mainFile) || proj.files[0];
            setActiveFilePath(mainFile.path);
            setFileContent(mainFile.content);
            setOpenFiles([mainFile.path]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch bot for editor:', err);
      }
    };
    loadBot();
  }, [selectedBotId]);

  // File click handler
  const handleSelectFile = (path: string) => {
    if (!currentProject) return;
    const targetFile = currentProject.files.find(f => f.path === path);
    if (targetFile) {
      setActiveFilePath(path);
      setFileContent(targetFile.content);
      if (!openFiles.includes(path)) {
        setOpenFiles(prev => [...prev, path]);
      }
    }
  };

  // Text changes handler
  const handleContentChange = (newVal: string) => {
    setFileContent(newVal);
    setUnsavedChanges(prev => ({ ...prev, [activeFilePath]: true }));
    if (currentProject) {
      const updatedFiles = currentProject.files.map(f => f.path === activeFilePath ? { ...f, content: newVal } : f);
      setCurrentProject({ ...currentProject, files: updatedFiles });
    }
  };

  // Save File handler
  const handleSaveFile = async () => {
    if (!currentProject || !activeFilePath) return;

    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch(`/api/projects/${currentProject.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({
          files: currentProject.files
        })
      });

      if (res.ok) {
        setUnsavedChanges(prev => ({ ...prev, [activeFilePath]: false }));
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (err) {
      console.error('Failed to save file:', err);
    } finally {
      setSaving(false);
    }
  };

  // Create New File
  const handleCreateFile = () => {
    if (!newFileName.trim() || !currentProject) return;

    const path = newFileName.trim();
    const newFile: BotFile = {
      path,
      content: path.endsWith('.json') ? '{\n}' : '// New code file\n'
    };

    const updatedFiles = [...currentProject.files, newFile];
    setCurrentProject({ ...currentProject, files: updatedFiles });
    setOpenFiles(prev => [...prev, path]);
    setActiveFilePath(path);
    setFileContent(newFile.content);
    setNewFileName('');
    setShowNewFileModal(false);
  };

  // Delete File
  const handleDeleteFile = (path: string) => {
    if (!currentProject) return;
    if (currentProject.files.length <= 1) return;

    const updatedFiles = currentProject.files.filter(f => f.path !== path);
    setCurrentProject({ ...currentProject, files: updatedFiles });
    setOpenFiles(prev => prev.filter(p => p !== path));

    if (activeFilePath === path) {
      const nextFile = updatedFiles[0];
      setActiveFilePath(nextFile.path);
      setFileContent(nextFile.content);
    }
  };

  // Bot Start / Stop from Editor
  const handleToggleBot = async () => {
    if (!currentProject) return;
    const action = currentProject.status === 'online' ? 'stop' : 'start';

    try {
      await fetch(`/api/projects/${currentProject.id}/${action}`, {
        method: 'POST',
        headers: getAuthHeader()
      });
      setCurrentProject(prev => prev ? { ...prev, status: action === 'start' ? 'online' : 'offline' } : null);
      setTerminalLogs(prev => [...prev, `[TRL Cloud IDE] Bot ${action === 'start' ? 'started' : 'stopped'}`]);
    } catch (err) {
      console.error('Error toggling bot:', err);
    }
  };

  // Terminal submission
  const handleTerminalCmd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalCmd.trim()) return;

    const cmd = terminalCmd.trim();
    setTerminalLogs(prev => [...prev, `$ ${cmd}`]);
    setTerminalCmd('');

    if (cmd.startsWith('npm install') || cmd.startsWith('pip install')) {
      setTimeout(() => {
        setTerminalLogs(prev => [...prev, `[TRL Package Manager] Installed dependencies successfully.`]);
      }, 1000);
    } else {
      setTimeout(() => {
        setTerminalLogs(prev => [...prev, `[TRL Cloud Shell] Command executed.`]);
      }, 500);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
        <span>Loading IDE Code Editor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-12">
      
      {/* Top IDE Toolbar */}
      <div className="p-4 rounded-2xl bg-[#0f1117] border border-indigo-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Code2 className="w-5 h-5 text-indigo-400 shrink-0" />
          
          <select
            value={selectedBotId}
            onChange={(e) => setSelectedBotId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-bold focus:outline-none focus:border-indigo-500"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.language})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleSaveFile}
            disabled={saving}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              saveSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
            }`}
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saveSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saveSuccess ? 'Saved!' : t('saveFile')}</span>
          </button>

          {currentProject && (
            <button
              onClick={handleToggleBot}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                currentProject.status === 'online'
                  ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
              }`}
            >
              {currentProject.status === 'online' ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{currentProject.status === 'online' ? 'Stop Bot' : t('runProject')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main IDE Interface: Explorer + Editor Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[600px] bg-[#08090d] rounded-3xl border border-indigo-500/20 overflow-hidden shadow-2xl">
        
        {/* Left Column: File Explorer Tree */}
        <div className="lg:col-span-1 bg-[#0a0c10] border-r border-slate-800/80 p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400">{t('botFiles')}</span>
              <button
                onClick={() => setShowNewFileModal(true)}
                className="p-1 rounded text-indigo-400 hover:bg-slate-800 transition-colors"
                title={t('newFile')}
              >
                <FilePlus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              {currentProject?.files.map((file) => (
                <div
                  key={file.path}
                  onClick={() => handleSelectFile(file.path)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs cursor-pointer transition-colors ${
                    activeFilePath === file.path ? 'bg-indigo-600/20 text-indigo-300 font-bold border border-indigo-500/30' : 'text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">{file.path}</span>
                  </div>

                  {currentProject.files.length > 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteFile(file.path); }}
                      className="opacity-0 hover:opacity-100 text-slate-500 hover:text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-500">
            <span>Entry File: </span>
            <strong className="text-indigo-400">{currentProject?.mainFile}</strong>
          </div>
        </div>

        {/* Right Column: Code Editor & Terminal (3 columns) */}
        <div className="lg:col-span-3 flex flex-col h-full bg-[#050608]">
          
          {/* File Tabs */}
          <div className="bg-[#0a0c10] border-b border-slate-800/80 flex items-center overflow-x-auto px-2 pt-2">
            {openFiles.map((path) => (
              <div
                key={path}
                onClick={() => handleSelectFile(path)}
                className={`px-3 py-1.5 rounded-t-xl text-xs flex items-center gap-2 cursor-pointer border-t border-x border-slate-800/80 ${
                  activeFilePath === path ? 'bg-[#050608] text-indigo-300 font-bold border-indigo-500/30' : 'text-slate-500 hover:bg-slate-900'
                }`}
              >
                <span>{path}</span>
                {unsavedChanges[path] && <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>}
              </div>
            ))}
          </div>

          {/* Code Textarea Area */}
          <div className="flex-1 p-3 overflow-hidden">
            <textarea
              value={fileContent}
              onChange={(e) => handleContentChange(e.target.value)}
              className="w-full h-full bg-transparent text-emerald-400 font-mono text-xs leading-relaxed focus:outline-none resize-none p-2"
              spellCheck={false}
            />
          </div>

          {/* Embedded Terminal Output */}
          <div className="h-32 bg-[#08090d] border-t border-slate-800 p-2 flex flex-col justify-between">
            <div className="overflow-y-auto font-mono text-[10px] space-y-1 text-slate-400 flex-1 px-2">
              <p className="text-slate-600">[TRL Cloud IDE Terminal Ready]</p>
              {terminalLogs.map((log, i) => (
                <div key={i} className="text-slate-300">{log}</div>
              ))}
            </div>

            <form onSubmit={handleTerminalCmd} className="flex items-center gap-2 pt-1 border-t border-slate-800/60">
              <span className="text-indigo-400 font-mono text-xs font-bold pl-2">$</span>
              <input
                type="text"
                value={terminalCmd}
                onChange={(e) => setTerminalCmd(e.target.value)}
                placeholder="Terminal command (e.g. npm install)..."
                className="flex-1 bg-transparent text-xs text-white font-mono focus:outline-none"
              />
            </form>
          </div>

        </div>

      </div>

      {/* Modal: New File */}
      {showNewFileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#0f1117] border border-indigo-500/20 space-y-4">
            <h3 className="text-sm font-bold text-white">{t('newFile')}</h3>
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="e.g. commands/ping.js or config.json"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowNewFileModal(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-400"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleCreateFile}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 text-white"
              >
                Create File
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
