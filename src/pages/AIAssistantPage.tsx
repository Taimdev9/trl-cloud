import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Send, Sparkles, Code2, Bug, Zap, Cpu, RefreshCw, Copy, Check, 
  Terminal, AlertTriangle, FileCode, CheckCircle2, Server, HelpCircle, Settings, ShieldCheck, Info
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { BotProject } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isFallback?: boolean;
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
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `👋 Hello! I am **Cloud Bot**, your dedicated AI Assistant for **TRL Cloud** (built by TRL TEAM FOR DEVELOPMENT).\n\nI can help you:\n- 🚀 **Write Discord.js v14 & Discord.py bots**\n- 🐞 **Debug errors & crashes in your logs**\n- ⚡ **Optimize bot performance & RAM**\n- 📂 **Analyze your hosted TRL Cloud projects**\n\nHow can I assist your bot project today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // AI Status
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  // Project Helper / Diagnostic State
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [analyzingProject, setAnalyzingProject] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchAIStatus();
  }, []);

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

  const handleSendMessage = async (promptText?: string) => {
    const textToSend = promptText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!promptText) setInput('');
    setIsLoading(true);

    try {
      const history = messages.slice(1).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        text: m.text
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToSend, history })
      });

      if (!res.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await res.json();

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isFallback: data.isFallback
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: `⚠️ Error contacting Cloud Bot: ${err.message || 'Server error'}. Please try again shortly.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeProject = async () => {
    if (!selectedProjectId) return;
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
        throw new Error('Failed to analyze project');
      }

      const data = await res.json();
      setAnalysisResult(data.analysis);
    } catch (e: any) {
      setAnalysisResult(`❌ Error performing project analysis: ${e.message}`);
    } finally {
      setAnalyzingProject(false);
    }
  };

  const copyToClipboard = (codeText: string, id: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper to render text with markdown code blocks and copy buttons
  const renderFormattedText = (content: string, msgId: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, idx) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const firstLine = lines[0].trim();
        let lang = 'text';
        let code = part.slice(3, -3).trim();

        if (firstLine && !firstLine.includes(' ') && !firstLine.includes('=')) {
          lang = firstLine;
          code = lines.slice(1).join('\n');
        }

        const blockId = `${msgId}-code-${idx}`;

        return (
          <div key={idx} className="my-3 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 font-mono text-xs">
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900 border-b border-slate-800 text-slate-400">
              <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider">{lang}</span>
              <button
                onClick={() => copyToClipboard(code, blockId)}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition text-[11px]"
              >
                {copiedId === blockId ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3.5 overflow-x-auto text-slate-200 leading-relaxed font-mono selection:bg-purple-900">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Format bold text and lists nicely
      return (
        <div key={idx} className="whitespace-pre-wrap leading-relaxed text-sm">
          {part}
        </div>
      );
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900/60 via-slate-900 to-slate-900 border border-purple-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Cloud Bot AI Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Bot className="w-8 h-8 text-purple-400" />
              AI Assistant for TRL Cloud
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl">
              Write bot scripts, diagnose runtime crash logs, resolve package conflicts, and generate production-ready Discord.js and Discord.py bot code.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
            <Server className="w-5 h-5 text-purple-400" />
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

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-800 space-x-2 sm:space-x-4">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'chat'
              ? 'border-purple-500 text-purple-400 bg-purple-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code2 className="w-4 h-4" />
          AI Coding Assistant
        </button>

        <button
          onClick={() => setActiveTab('analyzer')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'analyzer'
              ? 'border-purple-500 text-purple-400 bg-purple-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bug className="w-4 h-4" />
          Project & Log Helper
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'settings'
              ? 'border-purple-500 text-purple-400 bg-purple-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          AI Status & Config
        </button>
      </div>

      {/* Tab 1: AI Chat Interface */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Chat Box */}
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
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800 border border-purple-500/30 text-purple-400'
                  }`}>
                    {msg.sender === 'user' ? 'U' : <Bot className="w-4 h-4" />}
                  </div>

                  <div className={`rounded-2xl p-4 shadow-sm space-y-1 ${
                    msg.sender === 'user'
                      ? 'bg-purple-600 text-white rounded-tr-none'
                      : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-tl-none'
                  }`}>
                    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-1 mb-1 text-[11px] opacity-70">
                      <span className="font-semibold">{msg.sender === 'user' ? 'You' : 'Cloud Bot'}</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div className="text-sm">
                      {renderFormattedText(msg.text, msg.id)}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 mr-auto items-center">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Bot className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="bg-slate-800/90 border border-slate-700/60 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
                    <span className="text-xs text-slate-300 font-medium">Cloud Bot is thinking</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input Box */}
            <div className="p-4 bg-slate-950/80 border-t border-slate-800">
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
                  placeholder="Ask Cloud Bot to write code, fix errors, or explain bot logic..."
                  className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="px-5 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium text-sm flex items-center gap-2 shadow-lg transition"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </div>
          </div>

          {/* Quick Presets Side Panel */}
          <div className="space-y-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Quick Prompts
              </h3>
              <p className="text-xs text-slate-400">Click any prompt to ask Cloud Bot instantly:</p>

              <div className="space-y-2">
                <button
                  onClick={() => handleSendMessage("Create a Discord.js v14 slash command ping bot with embed response.")}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-xs text-slate-300 hover:text-purple-300 transition"
                >
                  🤖 Discord.js Slash Command Bot
                </button>

                <button
                  onClick={() => handleSendMessage("Create a complete Discord.py (Python) bot template with commands and event handlers.")}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-xs text-slate-300 hover:text-purple-300 transition"
                >
                  🐍 Discord.py Full Bot Template
                </button>

                <button
                  onClick={() => handleSendMessage("How do I keep my bot token secure and use process.env or os.getenv on TRL Cloud?")}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-xs text-slate-300 hover:text-purple-300 transition"
                >
                  🔑 Environment Variables Guide
                </button>

                <button
                  onClick={() => handleSendMessage("Explain why Discord bots crash with 'An invalid token was provided' or Gateway Disconnect errors.")}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-xs text-slate-300 hover:text-purple-300 transition"
                >
                  ⚡ Debug Gateway & Token Errors
                </button>
              </div>
            </div>

            <div className="bg-purple-900/10 border border-purple-500/20 rounded-2xl p-4 space-y-2">
              <h4 className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                Privacy & Security
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Cloud Bot runs via secure server-side proxy routes. API credentials are strictly stored in server environment variables and never exposed to the frontend.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Project & Log Helper */}
      {activeTab === 'analyzer' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Bug className="w-5 h-5 text-purple-400" />
              AI Project Log & Crash Diagnostic
            </h2>
            <p className="text-xs text-slate-400">
              Select one of your TRL Cloud bot projects. Cloud Bot will inspect files, main scripts, and execution logs to explain crashes and suggest code fixes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-semibold text-slate-300">Select Bot Project to Analyze:</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
              >
                {projects.length === 0 ? (
                  <option value="">No bot projects found. Create one first!</option>
                ) : (
                  projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.language}) - [{p.status.toUpperCase()}]
                    </option>
                  ))
                )}
              </select>
            </div>

            <button
              onClick={handleAnalyzeProject}
              disabled={!selectedProjectId || analyzingProject}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-lg transition"
            >
              {analyzingProject ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyzing Logs...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Diagnose Bot Project
                </>
              )}
            </button>
          </div>

          {analysisResult && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Cloud Bot Diagnostic Report
                </span>
                <button
                  onClick={() => copyToClipboard(analysisResult, 'analysis-report')}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy Report
                </button>
              </div>

              <div className="text-sm text-slate-200 leading-relaxed font-sans">
                {renderFormattedText(analysisResult, 'analysis')}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: AI Status & Settings */}
      {activeTab === 'settings' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-400" />
              AI Assistant System Configuration
            </h2>
            <p className="text-xs text-slate-400">
              Information regarding the server-side AI model integration for TRL Cloud.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-400">AI Assistant Name</span>
              <p className="text-base font-bold text-purple-300">Cloud Bot</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-400">Developer</span>
              <p className="text-base font-bold text-slate-100">TRL TEAM FOR DEVELOPMENT</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-400">AI Engine Provider</span>
              <p className="text-base font-bold text-slate-100">Google Gemini AI (@google/genai SDK)</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-400">AI Model</span>
              <p className="text-base font-bold text-emerald-400">gemini-3.6-flash</p>
            </div>
          </div>

          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              Environment Variable Configuration (Render & Hosting)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              To enable live AI generation on production platforms (such as Render or Docker), set the following environment variable in your service settings:
            </p>

            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-xs text-purple-300">
              AI_API_KEY=your_google_gemini_api_key_here
            </div>
            <p className="text-[11px] text-slate-500">
              Note: You can also use <code className="text-slate-400">GEMINI_API_KEY</code> as an alternative environment key name.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
