import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  BookOpen, Terminal, Key, FileArchive, Github, Shield, Layers, 
  Search, Check, Copy, ChevronRight, Server, Bot, Code2, Play, 
  AlertTriangle, Lock, HelpCircle, Cpu, Settings, Sparkles, RefreshCw
} from 'lucide-react';

interface DocArticle {
  id: string;
  titleKey: string;
  defaultTitle: string;
  icon: any;
  category: string;
  content: React.ReactNode;
}

export const DocsPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [activeDocId, setActiveDocId] = useState<string>('intro');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const docPages: DocArticle[] = [
    {
      id: 'intro',
      titleKey: 'docPage1Title',
      defaultTitle: '1. Introduction to TRL Cloud',
      icon: BookOpen,
      category: 'Overview',
      content: (
        <div className="space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
          <div className="p-5 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-cyan-200">
            <h3 className="font-extrabold text-base text-white mb-2 flex items-center gap-2">
              <Server className="w-5 h-5 text-cyan-400" />
              What is TRL Cloud?
            </h3>
            <p>
              TRL Cloud is a high-performance, developer-first cloud platform engineered by <strong>TRL TEAM FOR DEVELOPMENT</strong> specifically to host, manage, monitor, and scale Discord bots and automated microservices with zero infrastructure friction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <h4 className="font-bold text-white text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Who is it for?
              </h4>
              <p className="text-slate-400 text-xs">
                Discord bot developers, community admins, software engineers, and beginners who need 24/7 uptime without managing Linux servers or VPS setups manually.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <h4 className="font-bold text-white text-xs flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                What problems does it solve?
              </h4>
              <p className="text-slate-400 text-xs">
                Eliminates local machine dependencies, offline bot crashes, complex SSH terminal setup, environment variable security leaks, and difficult package installations.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'account',
      titleKey: 'docPage2Title',
      defaultTitle: '2. Creating an Account & Discord Login',
      icon: Key,
      category: 'Getting Started',
      content: (
        <div className="space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
          <p className="text-slate-400">
            Setting up your TRL Cloud account is fast and secure. You can register with an email or connect your Discord account in one click.
          </p>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <h4 className="font-bold text-white text-xs text-cyan-300">Step 1: Account Registration</h4>
              <p className="text-slate-400 text-xs">
                Click <strong>Register</strong> in the top navbar, enter your preferred username, email, and password. TRL Cloud automatically creates your encrypted workspace.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <h4 className="font-bold text-white text-xs text-cyan-300">Step 2: Connecting Discord Account</h4>
              <p className="text-slate-400 text-xs">
                In your <strong>Profile Settings</strong>, click <strong>Connect Discord Account</strong>. This enables OAuth single sign-on and links your bot owner privileges directly to your Discord user ID.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'dashboard',
      titleKey: 'docPage3Title',
      defaultTitle: '3. Dashboard & Metrics Explanation',
      icon: Layers,
      category: 'Navigation',
      content: (
        <div className="space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
          <p className="text-slate-400">
            The TRL Cloud Dashboard gives you a bird's-eye view of all your hosted bots, memory allocation, CPU load, and infrastructure status in real time.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <p className="font-bold text-white text-xs text-cyan-400 mb-1">Active Bots Metric</p>
              <p className="text-slate-400 text-xs">Shows how many bots are currently running and actively connected to Discord Gateway.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <p className="font-bold text-white text-xs text-emerald-400 mb-1">RAM & CPU Allocations</p>
              <p className="text-slate-400 text-xs">Monitors real container memory usage in MB to prevent memory leaks and process throttles.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'create-bot',
      titleKey: 'docPage4Title',
      defaultTitle: '4. Creating & Uploading Discord Bots',
      icon: FileArchive,
      category: 'Bot Management',
      content: (
        <div className="space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
          <p className="text-slate-400">
            TRL Cloud supports 4 deployment pathways for both Node.js (Discord.js v14) and Python (discord.py):
          </p>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <h4 className="font-bold text-white text-xs text-cyan-300 flex items-center gap-2">
                <FileArchive className="w-4 h-4 text-cyan-400" />
                Method A: .ZIP File Upload
              </h4>
              <p className="text-slate-400 text-xs">
                Compress your local bot directory (including <code className="text-cyan-300 bg-slate-950 px-1 py-0.5 rounded">package.json</code> or <code className="text-cyan-300 bg-slate-950 px-1 py-0.5 rounded">requirements.txt</code>) into a .ZIP and drop it into the upload box.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <h4 className="font-bold text-white text-xs text-cyan-300 flex items-center gap-2">
                <Github className="w-4 h-4 text-sky-400" />
                Method B: GitHub Repository Import
              </h4>
              <p className="text-slate-400 text-xs">
                Paste your public or private GitHub repository URL. TRL Cloud will clone the repository, detect dependencies, and prepare the runtime automatically.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <h4 className="font-bold text-white text-xs text-cyan-300 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-teal-400" />
                Method C: Online Code Editor (IDE)
              </h4>
              <p className="text-slate-400 text-xs">
                Write code directly inside your browser with syntax highlighting, file creation, and terminal commands.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'config',
      titleKey: 'docPage5Title',
      defaultTitle: '5. Bot Configuration & Environment Variables',
      icon: Settings,
      category: 'Bot Management',
      content: (
        <div className="space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
          <p className="text-slate-400">
            Never hardcode secret keys or tokens in code files. TRL Cloud provides encrypted Environment Variables management.
          </p>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h4 className="font-bold text-white text-xs">Recommended Environment Variable Keys:</h4>
            <div className="bg-slate-950 p-3 rounded-lg font-mono text-xs text-cyan-300 space-y-1">
              <p>BOT_TOKEN = "MTA5O..."</p>
              <p>CLIENT_ID = "1098..."</p>
              <p>GUILD_ID = "9876..."</p>
              <p>MONGO_URI = "mongodb+srv://..."</p>
            </div>
            <p className="text-xs text-slate-400">
              In Node.js, access via <code className="text-cyan-300">process.env.BOT_TOKEN</code>. In Python, access via <code className="text-cyan-300">os.getenv('BOT_TOKEN')</code>.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'running',
      titleKey: 'docPage6Title',
      defaultTitle: '6. Running, Stopping & Restarting Bots',
      icon: Play,
      category: 'Bot Operations',
      content: (
        <div className="space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
          <p className="text-slate-400">
            Control your bot container's lifecycle with one-click actions:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30 text-center">
              <Play className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <p className="font-bold text-white text-xs">Start Bot</p>
              <p className="text-slate-400 text-[11px] mt-1">Launches process container and connects to Discord Gateway.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-rose-500/30 text-center">
              <AlertTriangle className="w-6 h-6 text-rose-400 mx-auto mb-2" />
              <p className="font-bold text-white text-xs">Stop Bot</p>
              <p className="text-slate-400 text-[11px] mt-1">Safely shuts down the process and disconnects from Gateway.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/30 text-center">
              <RefreshCw className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <p className="font-bold text-white text-xs">Restart Bot</p>
              <p className="text-slate-400 text-[11px] mt-1">Flushes memory, reloads updated code, and restarts.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'logs',
      titleKey: 'docPage7Title',
      defaultTitle: '7. Real-time Logs & Crash Debugging',
      icon: Terminal,
      category: 'Bot Operations',
      content: (
        <div className="space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
          <p className="text-slate-400">
            The Console tabstreams live <code className="text-cyan-300">stdout</code> and <code className="text-rose-300">stderr</code> streams directly from your bot process.
          </p>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h4 className="font-bold text-white text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Automatic Error Diagnostic Engine
            </h4>
            <p className="text-slate-400 text-xs">
              TRL Cloud scans your crash logs for common Discord Gateway error codes (such as <code className="text-amber-300">TOKEN_INVALID</code>, <code className="text-amber-300">MODULE_NOT_FOUND</code>, or missing Privileged Intents) and highlights recommended instant fixes.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'ai-guide',
      titleKey: 'docPage8Title',
      defaultTitle: '8. AI Developer Assistant Guide',
      icon: Bot,
      category: 'AI & Tools',
      content: (
        <div className="space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
          <p className="text-slate-400">
            Cloud Bot is your built-in AI pair programmer powered by Gemini 3.6 Flash.
          </p>

          <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/20 space-y-3">
            <h4 className="font-bold text-white text-xs text-cyan-300 flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              Project Access Permission Control
            </h4>
            <p className="text-slate-400 text-xs">
              By default, AI cannot view your private bot code files. To let AI analyze your code structure and fix crash logs, toggle <strong>"Allow AI to access my project"</strong> to ON in the AI Assistant tab. You can disable access at any time.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'backup',
      titleKey: 'docPage9Title',
      defaultTitle: '9. Backup, Data Persistence & Safety',
      icon: Lock,
      category: 'Security',
      content: (
        <div className="space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
          <p className="text-slate-400">
            All your bot files, settings, and environment variables are backed up in TRL Cloud persistent databases.
          </p>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="font-bold text-white text-xs text-emerald-400">Downloading Project ZIP Backup</h4>
            <p className="text-slate-400 text-xs">
              At any time, go to your Bot Details page and click <strong>Download Project (.ZIP)</strong> to save a complete, offline archive of your code and configuration to your computer.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'faq',
      titleKey: 'docPage10Title',
      defaultTitle: '10. Frequently Asked Questions (FAQ)',
      icon: HelpCircle,
      category: 'Support',
      content: (
        <div className="space-y-4 text-slate-300 text-xs sm:text-sm leading-relaxed">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <h4 className="font-bold text-white text-xs text-cyan-300">Q: Is TRL Cloud free for Discord bot hosting?</h4>
            <p className="text-slate-400 text-xs">A: Yes! TRL Cloud provides free test project slots with generous RAM and CPU allocations for developers.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <h4 className="font-bold text-white text-xs text-cyan-300">Q: How do I get my Discord Bot Token?</h4>
            <p className="text-slate-400 text-xs">A: Go to discord.com/developers, create an Application, click Bot, click Reset Token, and paste it into TRL Cloud Environment Variables.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <h4 className="font-bold text-white text-xs text-cyan-300">Q: Does TRL Cloud support Python discord.py bots?</h4>
            <p className="text-slate-400 text-xs">A: Yes! Full support for Python 3.11+, discord.py, and requirements.txt package installations.</p>
          </div>
        </div>
      )
    }
  ];

  const filteredDocs = docPages.filter(doc => 
    doc.defaultTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeDoc = docPages.find(d => d.id === activeDocId) || docPages[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Documentation Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/50 border border-cyan-500/20 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-bold border border-cyan-500/30">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>TRL Cloud Official Knowledge Base</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            TRL Cloud Documentation System
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
            Complete 10-part guide covering bot creation, environment configuration, real-time logging, AI assistance, and security.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documentation..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
      </div>

      {/* Main Documentation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Navigation */}
        <div className="space-y-2 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl h-fit">
          <p className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 mb-3 px-2">
            10-Part Documentation Index
          </p>

          <div className="space-y-1">
            {filteredDocs.map((doc) => {
              const Icon = doc.icon;
              const isActive = activeDocId === doc.id;
              return (
                <button
                  key={doc.id}
                  onClick={() => setActiveDocId(doc.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span className="truncate">{t(doc.titleKey) || doc.defaultTitle}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-600'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Article Viewer */}
        <div className="lg:col-span-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                <activeDoc.icon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">{activeDoc.category}</span>
                <h2 className="text-lg sm:text-xl font-extrabold text-white">
                  {t(activeDoc.titleKey) || activeDoc.defaultTitle}
                </h2>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="pt-2">
            {activeDoc.content}
          </div>
        </div>

      </div>

    </div>
  );
};
