import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Send, Sparkles, Code2, Bug, Zap, Cpu, RefreshCw, Copy, Check, 
  Terminal, AlertTriangle, FileCode, CheckCircle2, Server, HelpCircle, Settings, 
  ShieldCheck, Info, Lock, Unlock, MessageSquare, Plus, Trash2, Search, History
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { BotProject } from '../types';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isFallback?: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: string;
}

interface AIStatus {
  assistantName: string;
  projectName: string;
  developer: string;
  provider: string;
  model: string;
  isConfigured: boolean;
  status: string;
}

export const AIAssistantPage: React.FC<{ projects: BotProject[]; token: string | null }> = ({ projects, token }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'chat' | 'analyzer' | 'settings'>('chat');
  
  // Project Access Permission Toggle (OFF by default for privacy)
  const [allowProjectAccess, setAllowProjectAccess] = useState<boolean>(() => {
    return localStorage.getItem('trl_ai_project_access') === 'true';
  });

  const handleToggleProjectAccess = (val: boolean) => {
    setAllowProjectAccess(val);
    localStorage.setItem('trl_ai_project_access', val ? 'true' : 'false');
  };

  // Chat Sessions History
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('trl_ai_chat_sessions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'session-default',
        title: 'Welcome to Cloud Bot AI',
        messages: [
          {
            id: 'welcome',
            sender: 'assistant',
            text: `👋 Hello! I am **Cloud Bot**, your dedicated AI Assistant for **TRL Cloud** (built by TRL TEAM FOR DEVELOPMENT).\n\nI can help you with:\n- 🚀 **Discord.js & Discord.py Bots**\n- 💻 **General Software Engineering & Web Apps**\n- 🐞 **Fixing runtime errors & crash logs**\n- ⚡ **Optimizing bot performance & RAM**\n- 🎮 **Game development & programming concepts**\n\nHow can I assist you today?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ],
        updatedAt: new Date().toISOString()
      }
    ];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(sessions[0]?.id || 'session-default');
  const [historySearch, setHistorySearch] = useState('');

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const messages = activeSession?.messages || [];

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // AI Status
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  // Project Helper State
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [analyzingProject, setAnalyzingProject] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchAIStatus();
  }, []);

  useEffect(() => {
    localStorage.setItem('trl_ai_chat_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const fetchAIStatus = async () => {
    setStatusLoading(true);
    try {
      const res = await fetch('/api/ai/status');
      if (res.ok) {
        const data = await res.json();
        setAiStatus(data);
      }
    } catch (e) {
      console.error('Failed to fetch AI status:', e);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleCreateNewChat = () => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'New Conversation',
      messages: [
        {
          id: 'welcome-new',
          sender: 'assistant',
          text: `👋 New conversation started! How can I assist you?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ],
      updatedAt: new Date().toISOString()
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) return;
    const filtered = sessions.filter(s => s.id !== sessionId);
    setSessions(filtered);
    if (activeSessionId === sessionId) {
      setActiveSessionId(filtered[0].id);
    }
  };

  const handleSendMessage = async (promptText?: string) => {
    const textToSend = promptText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Update active session messages
    const updatedMessages = [...messages, userMsg];
    
    // Update session title if first real prompt
    let newTitle = activeSession.title;
    if (activeSession.title === 'New Conversation' || activeSession.title === 'Welcome to Cloud Bot AI') {
      newTitle = textToSend.slice(0, 30) + (textToSend.length > 30 ? '...' : '');
    }

    setSessions(prev => prev.map(s => s.id === activeSessionId ? {
      ...s,
      title: newTitle,
      messages: updatedMessages,
      updatedAt: new Date().toISOString()
    } : s));

    if (!promptText) setInput('');
    setIsLoading(true);

    try {
      const history = updatedMessages.slice(1).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        text: m.text
      }));

      // If project access is enabled and selected project exists, pass project context
      let projectContext = null;
      if (allowProjectAccess && selectedProjectId) {
        const proj = projects.find(p => p.id === selectedProjectId);
        if (proj) {
          projectContext = {
            name: proj.name,
            language: proj.language,
            files: proj.files?.map(f => ({ path: f.path, content: f.content?.slice(0, 1000) }))
          };
        }
      }

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: textToSend, 
          history,
          projectAccess: allowProjectAccess,
          projectContext
        })
      });

      if (!res.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isFallback: data.isFallback
      };

      setSessions(prev => prev.map(s => s.id === activeSessionId ? {
        ...s,
        messages: [...s.messages, assistantMsg],
        updatedAt: new Date().toISOString()
      } : s));

    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: `⚠️ Error contacting Cloud Bot: ${err.message || 'Server error'}. Please try again shortly.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setSessions(prev => prev.map(s => s.id === activeSessionId ? {
        ...s,
        messages: [...s.messages, errorMsg],
        updatedAt: new Date().toISOString()
      } : s));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeProject = async () => {
    if (!selectedProjectId) return;
    if (!allowProjectAccess) {
      alert("Please enable 'Allow AI to access my project' in the privacy panel first.");
      return;
    }

    setAnalyzingProject(true);
    setAnalysisResult(null);

    try {
      const res = await fetch('/api/ai/analyze-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ projectId: selectedProjectId })
      });

      if (!res.ok) {
        throw new Error('Project analysis failed');
      }

      const data = await res.json();
      setAnalysisResult(data.analysis);
    } catch (e: any) {
      setAnalysisResult(`❌ Error analyzing project: ${e.message}`);
    } finally {
      setAnalyzingProject(false);
    }
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderFormattedText = (text: string, msgId: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, idx) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const languageStr = lines[0].trim();
        const hasLang = /^[a-zA-Z0-9_-]+$/.test(languageStr);
        const code = hasLang ? lines.slice(1).join('\n') : lines.join('\n');
        const langDisplay = hasLang ? languageStr : 'code';
        const codeBlockId = `${msgId}-${idx}`;

        return (
          <div key={idx} className="my-3 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-[11px] font-mono text-slate-400">
              <span className="uppercase text-cyan-400 font-bold">{langDisplay}</span>
              <button
                onClick={() => handleCopyCode(code, codeBlockId)}
                className="flex items-center gap-1.5 hover:text-white transition-colors"
              >
                {copiedId === codeBlockId ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3.5 overflow-x-auto text-slate-200 leading-relaxed font-mono text-xs">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      return (
        <div key={idx} className="whitespace-pre-wrap leading-relaxed text-xs sm:text-sm">
          {part}
        </div>
      );
    });
  };

  const filteredSessions = sessions.filter(s => 
    s.title.toLowerCase().includes(historySearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/50 border border-cyan-500/20 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Cloud Bot AI Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Bot className="w-8 h-8 text-cyan-400" />
              <span>AI Assistant & Developer Companion</span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
              Ask programming questions, generate Discord bot scripts, debug runtime errors, or grant permission for AI to analyze your hosted bot projects.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
            <Server className="w-5 h-5 text-cyan-400" />
            <div className="text-xs">
              <p className="text-slate-400">AI Model Status</p>
              <p className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {aiStatus?.model || 'gemini-3.6-flash'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Project Permission Status Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            allowProjectAccess ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
          }`}>
            {allowProjectAccess ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
          </div>
          <div>
            <p className="text-xs font-bold text-white flex items-center gap-2">
              <span>Project Access Permission:</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                allowProjectAccess ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
              }`}>
                {allowProjectAccess ? 'ENABLED' : 'DISABLED'}
              </span>
            </p>
            <p className="text-[11px] text-slate-400">
              {allowProjectAccess 
                ? 'AI is granted permission to inspect your bot files, project structure, and crash logs.' 
                : 'AI operates as a general tech assistant only. Private bot code is NOT accessed.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => handleToggleProjectAccess(!allowProjectAccess)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shrink-0 flex items-center gap-2 ${
            allowProjectAccess 
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700' 
              : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950'
          }`}
        >
          {allowProjectAccess ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          <span>{allowProjectAccess ? 'Revoke AI Access' : 'Allow AI Access'}</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 space-x-2 sm:space-x-4">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-medium border-b-2 transition-all ${
            activeTab === 'chat'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>General AI Chat & Code</span>
        </button>

        <button
          onClick={() => setActiveTab('analyzer')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-medium border-b-2 transition-all ${
            activeTab === 'analyzer'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bug className="w-4 h-4" />
          <span>Project & Log Analyzer</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-medium border-b-2 transition-all ${
            activeTab === 'settings'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>AI Config & Privacy</span>
        </button>
      </div>

      {/* Tab 1: AI Chat & History Interface */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left: Chat History Panel */}
          <div className="space-y-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 h-[650px] flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-400" />
                <span>Chat History</span>
              </span>
              <button
                onClick={handleCreateNewChat}
                className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-colors"
                title="Start New Conversation"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Search History */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search history..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* History Sessions List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {filteredSessions.map((s) => {
                const isActive = s.id === activeSessionId;
                return (
                  <div
                    key={s.id}
                    onClick={() => setActiveSessionId(s.id)}
                    className={`p-2.5 rounded-xl cursor-pointer text-xs flex items-center justify-between group transition-all ${
                      isActive 
                        ? 'bg-cyan-500/15 border border-cyan-500/30 text-white font-semibold' 
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                      <span className="truncate">{s.title}</span>
                    </div>

                    {sessions.length > 1 && (
                      <button
                        onClick={(e) => handleDeleteSession(s.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 transition-opacity"
                        title="Delete Session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Main Chat Window */}
          <div className="lg:col-span-3 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col h-[650px] shadow-xl overflow-hidden">
            
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-3xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.sender === 'user'
                      ? 'bg-cyan-400 text-slate-950 font-bold'
                      : 'bg-slate-950 border border-cyan-500/30 text-cyan-400'
                  }`}>
                    {msg.sender === 'user' ? 'U' : <Bot className="w-4 h-4" />}
                  </div>

                  <div className={`rounded-2xl p-4 shadow-sm space-y-1 ${
                    msg.sender === 'user'
                      ? 'bg-cyan-500 text-slate-950 font-medium rounded-tr-none'
                      : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-tl-none'
                  }`}>
                    <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-1 mb-1 text-[11px] opacity-70">
                      <span className="font-semibold">{msg.sender === 'user' ? 'You' : 'Cloud Bot'}</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div className="text-xs sm:text-sm">
                      {renderFormattedText(msg.text, msg.id)}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 mr-auto items-center">
                  <div className="w-8 h-8 rounded-full bg-slate-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Bot className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
                    <span className="text-xs text-slate-300 font-medium">Cloud Bot is thinking</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input Box */}
            <div className="p-4 bg-slate-950 border-t border-slate-800">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Cloud Bot about programming, Discord bots, software architecture, or debugging..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="px-5 py-3 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg transition"
                >
                  <Send className="w-4 h-4 text-slate-950" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </div>

          </div>

        </div>
      )}

      {/* Tab 2: Project & Log Analyzer */}
      {activeTab === 'analyzer' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Bug className="w-4 h-4 text-cyan-400" />
              <span>Project Diagnostic Helper</span>
            </h3>

            {!allowProjectAccess ? (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-2">
                <p className="font-bold flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  <span>Project Access Permission Required</span>
                </p>
                <p>To let Cloud Bot scan your project source files and error logs, please enable "Allow AI to access my project" above.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.language})
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleAnalyzeProject}
                    disabled={analyzingProject || !selectedProjectId}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-400 hover:bg-cyan-300 text-slate-950 transition-all flex items-center justify-center gap-2 shadow-md"
                  >
                    {analyzingProject ? <RefreshCw className="w-4 h-4 animate-spin text-slate-950" /> : <Sparkles className="w-4 h-4 text-slate-950" />}
                    <span>{analyzingProject ? 'Analyzing Project...' : 'Analyze Project Code & Logs'}</span>
                  </button>
                </div>

                {analysisResult && (
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs sm:text-sm text-slate-200">
                    <p className="font-bold text-cyan-400">Diagnostic Analysis Report:</p>
                    <div className="whitespace-pre-wrap leading-relaxed font-mono text-xs">
                      {analysisResult}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Settings & Privacy */}
      {activeTab === 'settings' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 text-xs sm:text-sm text-slate-300">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>AI Privacy & Access Controls</span>
          </h3>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-white text-xs">Allow AI Access to Project Files</p>
                <p className="text-slate-400 text-[11px] mt-0.5">When enabled, Gemini 3.6 Flash can inspect code and crash logs for diagnostics.</p>
              </div>
              <input
                type="checkbox"
                checked={allowProjectAccess}
                onChange={(e) => handleToggleProjectAccess(e.target.checked)}
                className="w-5 h-5 accent-cyan-400 rounded cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-white text-xs">Clear AI Chat History</p>
                <p className="text-slate-400 text-[11px] mt-0.5">Deletes all saved conversation threads from your browser storage.</p>
              </div>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete all AI chat history?')) {
                    localStorage.removeItem('trl_ai_chat_sessions');
                    window.location.reload();
                  }
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-400 border border-rose-500/30 hover:bg-rose-500/10 transition-colors"
              >
                Clear History
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
