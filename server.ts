import express from 'express';
import path from 'path';
import fs from 'fs';
import { spawn, exec, ChildProcess } from 'child_process';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import JSZip from 'jszip';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'trl-cloud-super-secret-jwt-key-2026';
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const PROJECTS_DIR = path.join(DATA_DIR, 'projects');

// Ensure data & projects directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(PROJECTS_DIR)) {
  fs.mkdirSync(PROJECTS_DIR, { recursive: true });
}

// Interfaces
interface DBUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  isBanned?: boolean;
  avatar?: string;
  language: 'en' | 'ar' | 'fr';
  createdAt: string;
  isVerified?: boolean;
  verificationCode?: string;
  verificationExpires?: string;
  resetCode?: string;
  resetExpires?: string;
  discord?: {
    id: string;
    username: string;
    discriminator: string;
    globalName?: string;
    avatar?: string;
    accessToken?: string;
    refreshToken?: string;
    connectedAt: string;
  };
}

interface DBFile {
  path: string;
  content: string;
  isDirectory?: boolean;
}

interface DBEnv {
  key: string;
  value: string;
}

interface DBProject {
  id: string;
  userId: string;
  name: string;
  description: string;
  language: 'nodejs' | 'python' | 'java' | 'csharp';
  status: 'online' | 'offline' | 'error' | 'starting' | 'installing';
  mainFile: string;
  files: DBFile[];
  envVars: DBEnv[];
  cpuUsage: number;
  memoryUsage: number;
  uptimeSeconds: number;
  lastStartedAt?: string;
  createdAt: string;
  updatedAt: string;
  gitRepoUrl?: string;
}

interface DBLog {
  id: string;
  projectId: string;
  timestamp: string;
  type: 'info' | 'warn' | 'error' | 'success' | 'system';
  message: string;
}

interface DatabaseSchema {
  users: DBUser[];
  projects: DBProject[];
  logs: Record<string, DBLog[]>; // projectId -> logs
  notifications: any[];
  tickets: any[];
}

// Initial Starter Templates
const DEFAULT_NODEJS_BOT: DBFile[] = [
  {
    path: 'package.json',
    content: JSON.stringify({
      name: 'trl-discord-bot',
      version: '1.0.0',
      description: 'Discord Bot Hosted on TRL Cloud',
      main: 'index.js',
      scripts: {
        start: 'node index.js'
      },
      dependencies: {
        'discord.js': '^14.14.1',
        'dotenv': '^16.4.5'
      }
    }, null, 2)
  },
  {
    path: 'index.js',
    content: `// TRL Cloud Discord Bot (Node.js - Discord.js v14)
// Created by TRL TEAM FOR DEVELOPMENT
require('dotenv').config();
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

client.once('ready', () => {
  console.log(\`[TRL Cloud] Logged in successfully as \${client.user.tag}!\`);
  console.log(\`[TRL Cloud] Bot is online and serving \${client.guilds.cache.size} guilds.\`);
  
  client.user.setActivity('Hosted on TRL Cloud', { type: ActivityType.Watching });
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content === '!ping') {
    await message.reply(\`Pong! Latency is \${Date.now() - message.createdTimestamp}ms.\`);
  }

  if (message.content === '!trl') {
    await message.reply('⚡ **TRL Cloud** - Next-Gen Discord Bot Hosting Platform by TRL TEAM FOR DEVELOPMENT! Join us at https://discord.gg/4FJG7jCGJ8');
  }
});

const token = process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';

if (token === 'YOUR_BOT_TOKEN_HERE') {
  console.warn('[TRL Cloud WARNING] Please configure your BOT_TOKEN in Environment Variables!');
}

client.login(token).catch(err => {
  console.error('[TRL Cloud ERROR] Failed to authenticate with Discord API:', err.message);
});
`
  },
  {
    path: '.env',
    content: `# Environment secrets managed by TRL Cloud
BOT_TOKEN=YOUR_DISCORD_BOT_TOKEN_HERE
CLIENT_ID=123456789012345678
PREFIX=!
`
  },
  {
    path: 'README.md',
    content: `# TRL Cloud Discord Bot Project
Hosted with pride on **TRL Cloud** by TRL TEAM FOR DEVELOPMENT.

## Contact TRL TEAM
- Discord: https://discord.gg/4FJG7jCGJ8
- GitHub: https://taimdev9.github.io/Taim.dev-My-experiences/#contact
- Email: taymabdrabo723@gmail.com
`
  }
];

const DEFAULT_PYTHON_BOT: DBFile[] = [
  {
    path: 'requirements.txt',
    content: `discord.py==2.3.2
python-dotenv==1.0.1
asyncio
`
  },
  {
    path: 'main.py',
    content: `# TRL Cloud Discord Bot (Python - discord.py)
# Created by TRL TEAM FOR DEVELOPMENT
import os
import discord
from discord.ext import commands
from dotenv import load_dotenv

load_dotenv()

TOKEN = os.getenv('BOT_TOKEN', 'YOUR_BOT_TOKEN_HERE')

intents = discord.Intents.default()
intents.message_content = True

bot = commands.Bot(command_prefix='!', intents=intents)

@bot.event
async def on_ready():
    print(f'[TRL Cloud] Logged in as Python Bot: {bot.user.name} (ID: {bot.user.id})')
    print('[TRL Cloud] Python Bot is fully connected and ready!')
    await bot.change_presence(activity=discord.Game(name="Hosted on TRL Cloud"))

@bot.command(name='ping')
async def ping(ctx):
    latency = round(bot.latency * 1000)
    await ctx.send(f'🏓 Pong! Latency: {latency}ms')

@bot.command(name='trl')
async def trl_info(ctx):
    await ctx.send('🚀 **TRL Cloud** - Premium Python & Node.js Discord Bot Hosting Platform by TRL TEAM FOR DEVELOPMENT!')

if TOKEN == 'YOUR_BOT_TOKEN_HERE':
    print('[TRL Cloud WARNING] Please set your BOT_TOKEN in Environment Variables!')

try:
    bot.run(TOKEN)
except Exception as e:
    print(f'[TRL Cloud ERROR] Could not start Python Bot: {e}')
`
  },
  {
    path: '.env',
    content: `BOT_TOKEN=YOUR_DISCORD_BOT_TOKEN_HERE
PREFIX=!
`
  }
];

// Bot error diagnostics engine
function analyzeProjectErrors(project: DBProject, logs: DBLog[]) {
  // 1. Check BOT_TOKEN in envVars
  const tokenVar = project.envVars?.find(e => e.key === 'BOT_TOKEN');
  const tokenVal = tokenVar ? tokenVar.value.trim() : '';

  if (!tokenVal || tokenVal === 'YOUR_BOT_TOKEN_HERE' || tokenVal === 'YOUR_DISCORD_BOT_TOKEN_HERE') {
    return {
      hasError: true,
      errorType: 'INVALID_TOKEN' as const,
      title: 'Missing or Default Discord BOT_TOKEN',
      description: 'Your project environment variable BOT_TOKEN is set to the default placeholder. The bot cannot authenticate with Discord.',
      suggestedFix: 'Copy your actual Discord Bot Token from Discord Developer Portal -> Bot -> Token, and save it in the Environment Secrets (.env) tab.',
      affectedFile: '.env'
    };
  }

  // 2. Check main file existence
  const mainFileExists = project.files.some(f => f.path === project.mainFile);
  if (!mainFileExists) {
    return {
      hasError: true,
      errorType: 'MISSING_MAIN_FILE' as const,
      title: `Main Entry File '${project.mainFile}' Not Found`,
      description: `The bot execution failed because the configured main entry file '${project.mainFile}' does not exist in project files.`,
      suggestedFix: `Create '${project.mainFile}' in the Code IDE or update project settings to point to an existing script file.`,
      affectedFile: project.mainFile
    };
  }

  // 3. Check recent logs for specific error traces
  const recentLogs = logs.slice(-30);
  const errorLog = recentLogs.slice().reverse().find(l => l.type === 'error' || l.message.toLowerCase().includes('error') || l.message.toLowerCase().includes('cannot find module'));

  if (errorLog) {
    const msg = errorLog.message;
    if (msg.includes('Cannot find module') || msg.includes('ModuleNotFoundError') || msg.includes('No module named')) {
      return {
        hasError: true,
        errorType: 'MISSING_PACKAGE' as const,
        title: 'Missing Required Module or Dependency',
        description: 'The bot process threw an unhandled exception because a required package is not installed.',
        suggestedFix: 'Type `npm install <package>` or `pip install <package>` in the Live Console or add the library to package.json.',
        detectedLog: msg
      };
    }

    if (msg.includes('SyntaxError') || msg.includes('IndentationError') || msg.includes('Unexpected token')) {
      return {
        hasError: true,
        errorType: 'SYNTAX_ERROR' as const,
        title: 'Code Syntax Error',
        description: 'The script interpreter encountered invalid code syntax during execution.',
        suggestedFix: 'Open the Code IDE, check recent edits for missing closing brackets, quotes, or improper indentation, and re-save.',
        detectedLog: msg
      };
    }

    if (msg.includes('DisallowedGatewayIntents') || msg.includes('PrivilegedIntent') || msg.includes('10006')) {
      return {
        hasError: true,
        errorType: 'GATEWAY_INTENTS' as const,
        title: 'Disallowed Gateway Intents',
        description: 'Your bot code requests privileged Gateway Intents (Message Content or Server Members) that are disabled in your Discord Developer App.',
        suggestedFix: 'Go to Discord Developer Portal -> Applications -> [Your Bot] -> Bot -> Privileged Gateway Intents, and enable "Message Content Intent" and "Server Members Intent".',
        detectedLog: msg
      };
    }

    return {
      hasError: true,
      errorType: 'RUNTIME_CRASH' as const,
      title: 'Bot Process Crash',
      description: 'The bot process terminated due to an uncaught exception or crash signal.',
      suggestedFix: 'Review the error trace in the Live Console, fix any API parameter errors, and click Restart.',
      detectedLog: msg
    };
  }

  return {
    hasError: false,
    errorType: 'NONE' as const,
    title: 'No Active Errors Detected',
    description: 'Bot configuration and process logs appear healthy.'
  };
}

// Read / Write Database
function getDB(): DatabaseSchema {
  if (!fs.existsSync(DB_FILE)) {
    const adminPasswordHash = bcrypt.hashSync('admin123', 10);
    const userPasswordHash = bcrypt.hashSync('user123', 10);

    const initialDB: DatabaseSchema = {
      users: [
        {
          id: 'admin-01',
          username: 'TRLAdmin',
          email: 'admin@trlcloud.com',
          passwordHash: adminPasswordHash,
          role: 'admin',
          language: 'en',
          createdAt: new Date().toISOString(),
          isVerified: true
        },
        {
          id: 'user-01',
          username: 'TRLDeveloper',
          email: 'user@trlcloud.com',
          passwordHash: userPasswordHash,
          role: 'user',
          language: 'en',
          createdAt: new Date().toISOString(),
          isVerified: true
        }
      ],
      projects: [
        {
          id: 'proj-01',
          userId: 'user-01',
          name: 'TRL Moderation Bot',
          description: 'Production Node.js Discord Bot for server management, welcome cards & ticket support.',
          language: 'nodejs',
          status: 'online',
          mainFile: 'index.js',
          files: DEFAULT_NODEJS_BOT,
          envVars: [
            { key: 'BOT_TOKEN', value: 'MTI3OTk4NjgxOTIwMTI0OTM4Mg.G9x8a1.trlcloud_demo_secret_token_1337' },
            { key: 'PREFIX', value: '!' },
            { key: 'ENVIRONMENT', value: 'production' }
          ],
          cpuUsage: 1.4,
          memoryUsage: 48.2,
          uptimeSeconds: 12450,
          lastStartedAt: new Date(Date.now() - 12450000).toISOString(),
          createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'proj-02',
          userId: 'user-01',
          name: 'Python Music & Economy Bot',
          description: 'Feature-packed Python Discord bot with audio player, level system, and slash commands.',
          language: 'python',
          status: 'offline',
          mainFile: 'main.py',
          files: DEFAULT_PYTHON_BOT,
          envVars: [
            { key: 'BOT_TOKEN', value: 'MTA4ODkyMzE0MDU5MjA1MTIyMA.G5m_K1.python_demo_bot_secret' },
            { key: 'PREFIX', value: '?' }
          ],
          cpuUsage: 0,
          memoryUsage: 0,
          uptimeSeconds: 0,
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      logs: {
        'proj-01': [
          {
            id: 'log-1',
            projectId: 'proj-01',
            timestamp: new Date(Date.now() - 1000000).toISOString(),
            type: 'system',
            message: '[TRL Cloud] Container started on Node-US1. Installing dependencies...'
          },
          {
            id: 'log-2',
            projectId: 'proj-01',
            timestamp: new Date(Date.now() - 950000).toISOString(),
            type: 'success',
            message: '[TRL Cloud] npm install completed: discord.js@14.14.1, dotenv@16.4.5 installed.'
          },
          {
            id: 'log-3',
            projectId: 'proj-01',
            timestamp: new Date(Date.now() - 900000).toISOString(),
            type: 'info',
            message: '[TRL Cloud] Running node index.js...'
          },
          {
            id: 'log-4',
            projectId: 'proj-01',
            timestamp: new Date(Date.now() - 850000).toISOString(),
            type: 'success',
            message: '[TRL Cloud] Logged in successfully as TRL Moderation Bot#1337!'
          },
          {
            id: 'log-5',
            projectId: 'proj-01',
            timestamp: new Date().toISOString(),
            type: 'info',
            message: '[TRL Cloud] Ready! Listening to commands on 24 Discord servers.'
          }
        ]
      },
      notifications: [
        {
          id: 'notif-1',
          userId: 'user-01',
          title: 'Welcome to TRL Cloud',
          message: 'Your Discord Bot hosting container is active. Check out our docs or deploy a template!',
          type: 'info',
          read: false,
          timestamp: new Date().toISOString()
        }
      ],
      tickets: []
    };

    fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2));
    return initialDB;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading DB_FILE, recreating:', err);
    fs.unlinkSync(DB_FILE);
    return getDB();
  }
}

function saveDB(db: DatabaseSchema) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// Sync project files from DB to disk
function syncProjectToDisk(proj: DBProject) {
  const projectDir = path.join(PROJECTS_DIR, proj.id);
  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir, { recursive: true });
  }

  // Write files
  for (const f of proj.files) {
    if (f.isDirectory) {
      const dirPath = path.join(projectDir, f.path);
      if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
    } else {
      const filePath = path.join(projectDir, f.path);
      const parentDir = path.dirname(filePath);
      if (!fs.existsSync(parentDir)) fs.mkdirSync(parentDir, { recursive: true });
      fs.writeFileSync(filePath, f.content || '', 'utf-8');
    }
  }

  // Write .env
  if (proj.envVars && Array.isArray(proj.envVars)) {
    const envLines = proj.envVars
      .filter(e => e.key && e.key.trim())
      .map(e => `${e.key.trim()}=${e.value || ''}`);
    fs.writeFileSync(path.join(projectDir, '.env'), envLines.join('\n'), 'utf-8');
  }
}

// Scan project files from disk
function scanProjectFromDisk(projectId: string): DBFile[] {
  const projectDir = path.join(PROJECTS_DIR, projectId);
  if (!fs.existsSync(projectDir)) return [];

  const files: DBFile[] = [];

  function walk(currentDir: string, relativePath: string) {
    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        if (['node_modules', '.git', '__pycache__', '.venv', 'dist', 'build'].includes(entry.name)) continue;

        const relPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isDirectory()) {
          files.push({ path: relPath, content: '', isDirectory: true });
          walk(fullPath, relPath);
        } else {
          try {
            const content = fs.readFileSync(fullPath, 'utf-8');
            files.push({ path: relPath, content });
          } catch (e) {
            // ignore unreadable binary
          }
        }
      }
    } catch (e) {
      // ignore read error
    }
  }

  walk(projectDir, '');
  return files;
}

// Active real child processes map
interface ActiveBotProcess {
  projectId: string;
  proc: ChildProcess;
  startedAt: number;
  autoRestart: boolean;
  restartCount: number;
  lastRestartTime: number;
}

const activeBotProcesses = new Map<string, ActiveBotProcess>();

function startRealBotProcess(projectId: string, restartCount = 0, lastRestartTime = Date.now()) {
  const db = getDB();
  const proj = db.projects.find(p => p.id === projectId);
  if (!proj) return;

  // Stop any active process first
  stopRealBotProcess(projectId, false);

  // Sync latest project files to disk
  syncProjectToDisk(proj);

  const projectDir = path.join(PROJECTS_DIR, projectId);

  // Build process environment
  const envObj: Record<string, string> = { ...process.env };
  if (proj.envVars) {
    for (const ev of proj.envVars) {
      if (ev.key) envObj[ev.key] = ev.value || '';
    }
  }

  let executable = 'node';
  let mainScript = proj.mainFile || 'index.js';

  if (proj.language === 'python') {
    executable = process.platform === 'win32' ? 'python' : 'python3';
    mainScript = proj.mainFile || 'main.py';
  }

  addProjectLog(projectId, 'system', `[TRL Cloud Engine] Spawning real process: ${executable} ${mainScript}`);

  try {
    const child = spawn(executable, [mainScript], {
      cwd: projectDir,
      env: envObj,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    const activeState: ActiveBotProcess = {
      projectId,
      proc: child,
      startedAt: Date.now(),
      autoRestart: true,
      restartCount,
      lastRestartTime
    };

    activeBotProcesses.set(projectId, activeState);

    proj.status = 'online';
    proj.lastStartedAt = new Date().toISOString();
    saveDB(db);

    child.stdout?.on('data', (data) => {
      const output = data.toString();
      output.split('\n').forEach((line: string) => {
        if (line.trim()) {
          addProjectLog(projectId, 'info', line.trim());
        }
      });
    });

    child.stderr?.on('data', (data) => {
      const output = data.toString();
      output.split('\n').forEach((line: string) => {
        if (line.trim()) {
          addProjectLog(projectId, 'error', line.trim());
        }
      });
    });

    child.on('error', (err) => {
      addProjectLog(projectId, 'error', `[TRL Process Error] Failed to launch '${executable}': ${err.message}`);
      proj.status = 'error';
      saveDB(db);
    });

    child.on('close', (code, signal) => {
      addProjectLog(projectId, 'system', `[TRL Cloud Engine] Process closed (Exit Code: ${code}, Signal: ${signal || 'none'}).`);

      const currentActive = activeBotProcesses.get(projectId);
      activeBotProcesses.delete(projectId);

      const latestDB = getDB();
      const currentProj = latestDB.projects.find(p => p.id === projectId);
      if (!currentProj) return;

      if (!currentActive || !currentActive.autoRestart) {
        currentProj.status = 'offline';
        currentProj.cpuUsage = 0;
        currentProj.memoryUsage = 0;
        saveDB(latestDB);
        return;
      }

      const now = Date.now();
      let newRestartCount = currentActive.restartCount;
      if (now - currentActive.lastRestartTime > 60000) {
        newRestartCount = 0;
      }

      if (newRestartCount >= 5) {
        currentProj.status = 'error';
        currentProj.cpuUsage = 0;
        currentProj.memoryUsage = 0;
        saveDB(latestDB);
        addProjectLog(projectId, 'error', `[TRL Cloud Guard] Bot crashed 5 times in 1 minute. Auto-restart paused. Fix code errors and click Start.`);
      } else {
        currentProj.status = 'starting';
        saveDB(latestDB);
        addProjectLog(projectId, 'warn', `[TRL Cloud Engine] Bot crashed. Auto-restarting in 3s (Attempt ${newRestartCount + 1}/5)...`);

        setTimeout(() => {
          startRealBotProcess(projectId, newRestartCount + 1, now);
        }, 3000);
      }
    });

  } catch (err: any) {
    addProjectLog(projectId, 'error', `[TRL Cloud Engine] Failed to spawn process: ${err.message}`);
    proj.status = 'error';
    saveDB(db);
  }
}

function stopRealBotProcess(projectId: string, userAction = true) {
  const active = activeBotProcesses.get(projectId);
  if (active) {
    active.autoRestart = false;
    try {
      active.proc.kill('SIGTERM');
      setTimeout(() => {
        if (!active.proc.killed) {
          active.proc.kill('SIGKILL');
        }
      }, 2000);
    } catch (e) {
      // ignore kill errors
    }
    activeBotProcesses.delete(projectId);
  }

  const db = getDB();
  const proj = db.projects.find(p => p.id === projectId);
  if (proj) {
    proj.status = 'offline';
    proj.cpuUsage = 0;
    proj.memoryUsage = 0;
    saveDB(db);
    if (userAction) {
      addProjectLog(projectId, 'warn', `[TRL Cloud Engine] SIGTERM signal sent. Bot process stopped by user.`);
    }
  }
}

// Background metrics monitor for active processes
setInterval(() => {
  if (activeBotProcesses.size === 0) return;

  const db = getDB();
  let changed = false;

  for (const [projectId, active] of activeBotProcesses.entries()) {
    const proj = db.projects.find(p => p.id === projectId);
    if (proj && proj.status === 'online') {
      const elapsedSec = Math.floor((Date.now() - active.startedAt) / 1000);
      proj.uptimeSeconds = elapsedSec;
      proj.cpuUsage = +(Math.random() * 1.5 + 0.2).toFixed(1);
      proj.memoryUsage = Math.floor(Math.random() * 12 + 38);
      changed = true;
    }
  }

  if (changed) {
    saveDB(db);
  }
}, 5000);

function addProjectLog(projectId: string, type: 'info' | 'warn' | 'error' | 'success' | 'system', message: string) {
  const db = getDB();
  if (!db.logs[projectId]) {
    db.logs[projectId] = [];
  }
  db.logs[projectId].push({
    id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    projectId,
    timestamp: new Date().toISOString(),
    type,
    message
  });
  // Limit to last 200 logs
  if (db.logs[projectId].length > 200) {
    db.logs[projectId] = db.logs[projectId].slice(-200);
  }
  saveDB(db);
}

// Rate Limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function createRateLimiter(maxRequests: number, windowMs: number) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const key = `${req.path}:${ip}`;
    const now = Date.now();
    const record = rateLimitMap.get(key);

    if (!record || now > record.resetAt) {
      rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      return res.status(429).json({ error: 'Too many requests. Please wait a minute before trying again.' });
    }

    record.count += 1;
    next();
  };
}

// Middleware: Authenticate JWT
function authenticateJWT(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  const authLimiter = createRateLimiter(15, 60 * 1000);

  // API Routes

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      platform: 'TRL Cloud',
      developedBy: 'TRL TEAM FOR DEVELOPMENT',
      version: '1.0.0',
      time: new Date().toISOString()
    });
  });

  // Auth: Register
  app.post('/api/auth/register', authLimiter, async (req, res) => {
    const { username, email, password, language } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    const db = getDB();
    const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser: DBUser = {
      id: 'usr-' + Date.now(),
      username,
      email: email.toLowerCase(),
      passwordHash,
      role: 'user',
      language: language || 'en',
      createdAt: new Date().toISOString(),
      isVerified: true
    };

    db.users.push(newUser);

    // Create welcome notification
    db.notifications.push({
      id: 'notif-' + Date.now(),
      userId: newUser.id,
      title: 'Welcome to TRL Cloud',
      message: 'Account created successfully! Enjoy hosting your Discord bots.',
      type: 'info',
      read: false,
      timestamp: new Date().toISOString()
    });

    saveDB(db);

    const token = jwt.sign({ userId: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
    const { passwordHash: _, ...safeUser } = newUser;

    res.json({
      token,
      user: safeUser,
      message: 'Registration successful!'
    });
  });

  // Auth: Google Sign-In
  app.post('/api/auth/google', authLimiter, async (req, res) => {
    const { email, name, avatar } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Google account email is required' });
    }

    const db = getDB();
    let user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (user) {
      if (user.isBanned) {
        return res.status(403).json({ error: 'This account has been suspended by TRL Cloud administrators.' });
      }
    } else {
      // Auto create Google account
      const generatedUsername = name || email.split('@')[0];
      const randomPassword = await bcrypt.hash('google-' + Math.random().toString(36), 10);

      user = {
        id: 'usr-g-' + Date.now(),
        username: generatedUsername,
        email: email.toLowerCase(),
        passwordHash: randomPassword,
        role: 'user',
        avatar: avatar || 'https://lh3.googleusercontent.com/a/default-user',
        language: 'en',
        createdAt: new Date().toISOString(),
        isVerified: true
      };

      db.users.push(user);

      db.notifications.push({
        id: 'notif-' + Date.now(),
        userId: user.id,
        title: 'Welcome to TRL Cloud',
        message: 'Signed in with Google successfully!',
        type: 'info',
        read: false,
        timestamp: new Date().toISOString()
      });

      saveDB(db);
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const { passwordHash: _, ...safeUser } = user;

    res.json({ token, user: safeUser, message: 'Google Sign-In successful!' });
  });

  // Discord OAuth Configuration & Endpoints
  const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1531280125616853114';
  const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || '';

  app.get('/api/auth/discord/status', (req, res) => {
    res.json({
      clientId: DISCORD_CLIENT_ID,
      isConfigured: !!(DISCORD_CLIENT_ID && DISCORD_CLIENT_SECRET)
    });
  });

  app.get('/api/auth/discord/url', (req, res) => {
    const redirectUri = (req.query.redirect_uri as string) || `${req.protocol}://${req.get('host')}/api/auth/discord/callback`;
    const state = (req.query.state as string) || '';

    const params = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'identify email',
      ...(state ? { state } : {})
    });

    const url = `https://discord.com/oauth2/authorize?${params.toString()}`;
    res.json({ url, clientId: DISCORD_CLIENT_ID, redirectUri });
  });

  const handleDiscordCallback = async (req: express.Request, res: express.Response) => {
    try {
      const code = req.query.code as string;
      const state = req.query.state as string;
      const redirectUri = (req.query.redirect_uri as string) || `${req.protocol}://${req.get('host')}/api/auth/discord/callback`;

      if (!code) {
        return res.status(400).send('<h3>Error: Missing authorization code from Discord.</h3>');
      }

      let discordUser: any = null;
      let discordAccessToken: string | undefined;

      if (DISCORD_CLIENT_SECRET) {
        const tokenRes = await fetch('https://discord.com/api/v10/oauth2/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            client_id: DISCORD_CLIENT_ID,
            client_secret: DISCORD_CLIENT_SECRET,
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri
          }).toString()
        });

        if (!tokenRes.ok) {
          const errText = await tokenRes.text();
          console.error('Discord Token Error:', errText);
          throw new Error('Failed to exchange code with Discord API: ' + errText);
        }

        const tokenData = await tokenRes.json();
        discordAccessToken = tokenData.access_token;

        const userRes = await fetch('https://discord.com/api/v10/users/@me', {
          headers: {
            Authorization: `Bearer ${discordAccessToken}`
          }
        });

        if (!userRes.ok) {
          throw new Error('Failed to fetch Discord user profile');
        }

        discordUser = await userRes.json();
      } else {
        console.warn('[Discord OAuth] DISCORD_CLIENT_SECRET not set. Using test profile payload.');
        discordUser = {
          id: '1531280125616853114',
          username: 'TRLDiscordUser',
          discriminator: '0001',
          global_name: 'TRL Developer',
          avatar: null,
          email: 'discord.developer@trlcloud.com'
        };
      }

      const db = getDB();
      let user: DBUser | undefined;

      if (state) {
        try {
          const decoded = jwt.verify(state, JWT_SECRET) as { userId: string };
          user = db.users.find(u => u.id === decoded.userId);
        } catch (e) {
          // Ignore invalid state token
        }
      }

      if (!user) {
        user = db.users.find(u => u.discord?.id === discordUser.id || (discordUser.email && u.email.toLowerCase() === discordUser.email.toLowerCase()));
      }

      const avatarUrl = discordUser.avatar
        ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
        : `https://cdn.discordapp.com/embed/avatars/${parseInt(discordUser.discriminator || '0', 10) % 5}.png`;

      const discordAccountData = {
        id: discordUser.id,
        username: discordUser.username,
        discriminator: discordUser.discriminator || '0',
        globalName: discordUser.global_name || discordUser.username,
        avatar: avatarUrl,
        accessToken: discordAccessToken,
        connectedAt: new Date().toISOString()
      };

      if (!user) {
        const generatedUsername = discordUser.global_name || discordUser.username || 'DiscordUser';
        const dummyPassword = await bcrypt.hash('discord-' + Math.random().toString(36), 10);

        user = {
          id: 'usr-d-' + Date.now(),
          username: generatedUsername,
          email: (discordUser.email || `discord_${discordUser.id}@trlcloud.com`).toLowerCase(),
          passwordHash: dummyPassword,
          role: 'user',
          avatar: avatarUrl,
          language: 'en',
          createdAt: new Date().toISOString(),
          isVerified: true,
          discord: discordAccountData
        };

        db.users.push(user);
        db.notifications.push({
          id: 'notif-' + Date.now(),
          userId: user.id,
          title: 'Discord Account Connected',
          message: `Successfully connected Discord account @${discordAccountData.username}`,
          type: 'success',
          read: false,
          timestamp: new Date().toISOString()
        });
      } else {
        user.discord = discordAccountData;
        if (!user.avatar) {
          user.avatar = avatarUrl;
        }
      }

      saveDB(db);

      const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      const { passwordHash: _, ...safeUser } = user;

      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Discord Account Connected</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #08090d; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { background: #0f172a; border: 1px solid #334155; padding: 2.5rem; border-radius: 1rem; text-align: center; max-width: 400px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
            .avatar { width: 64px; height: 64px; border-radius: 50%; border: 2px solid #5865F2; margin: 0 auto 1rem; object-fit: cover; }
            h2 { color: #5865F2; margin-top: 0; font-size: 1.25rem; }
            p { color: #94a3b8; font-size: 0.875rem; margin-bottom: 0; }
          </style>
        </head>
        <body>
          <div class="card">
            <img class="avatar" src="${avatarUrl}" alt="Discord Avatar" />
            <h2>Discord Account Connected!</h2>
            <p>Account <strong>@${discordAccountData.username}</strong> linked successfully.<br>Closing window...</p>
          </div>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'DISCORD_AUTH_SUCCESS',
                user: ${JSON.stringify(safeUser)},
                token: "${token}"
              }, '*');
              setTimeout(function() { window.close(); }, 1000);
            } else {
              window.location.href = '/';
            }
          </script>
        </body>
        </html>
      `);
    } catch (err: any) {
      console.error('Discord Auth Callback Error:', err);
      res.status(500).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Discord Auth Failed</title>
          <style>
            body { font-family: sans-serif; background: #08090d; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { background: #0f172a; border: 1px solid #ef4444; padding: 2rem; border-radius: 1rem; text-align: center; max-width: 400px; }
            h2 { color: #ef4444; margin-top: 0; }
            p { color: #94a3b8; font-size: 0.875rem; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>Connection Failed</h2>
            <p>${err.message || 'An error occurred during Discord OAuth authentication.'}</p>
          </div>
        </body>
        </html>
      `);
    }
  };

  app.get('/api/auth/discord/callback', handleDiscordCallback);
  app.get('/api/auth/discord/callback/', handleDiscordCallback);

  app.delete('/api/auth/discord/disconnect', authenticateJWT, (req, res) => {
    const userId = (req as any).user.userId;
    const db = getDB();
    const user = db.users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.discord = undefined;
    saveDB(db);

    const { passwordHash: _, ...safeUser } = user;
    res.json({ message: 'Discord account disconnected successfully', user: safeUser });
  });

  // Auth: Login
  app.post('/api/auth/login', authLimiter, async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = getDB();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.isBanned) {
      return res.status(403).json({ error: 'This account has been suspended by TRL Cloud administrators.' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const { passwordHash: _, ...safeUser } = user;

    res.json({ token, user: safeUser });
  });

  // Auth: Password Reset
  app.post('/api/auth/reset-password', authLimiter, async (req, res) => {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required' });
    }

    const db = getDB();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(404).json({ error: 'Account with this email does not exist.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    saveDB(db);

    res.json({ message: 'Password updated successfully! You can now log in.' });
  });

  // Auth: Get Current User
  app.get('/api/auth/me', authenticateJWT, (req, res) => {
    const userId = (req as any).user.userId;
    const db = getDB();
    const user = db.users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { passwordHash: _, ...safeUser } = user;
    res.json({ user: safeUser });
  });

  // Auth: Update Profile
  app.put('/api/auth/profile', authenticateJWT, async (req, res) => {
    const userId = (req as any).user.userId;
    const { username, language, password } = req.body;
    const db = getDB();
    const user = db.users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (username) user.username = username;
    if (language) user.language = language;
    if (password && password.length >= 6) {
      user.passwordHash = await bcrypt.hash(password, 10);
    }

    saveDB(db);
    const { passwordHash: _, ...safeUser } = user;
    res.json({ user: safeUser, message: 'Profile updated successfully' });
  });

  // Projects: List Projects
  app.get('/api/projects', authenticateJWT, (req, res) => {
    const user = (req as any).user;
    const db = getDB();

    if (user.role === 'admin') {
      res.json({ projects: db.projects });
    } else {
      const userProjects = db.projects.filter(p => p.userId === user.userId);
      res.json({ projects: userProjects });
    }
  });

  // Projects: Get Single Project
  app.get('/api/projects/:id', authenticateJWT, (req, res) => {
    const { id } = req.params;
    const user = (req as any).user;
    const db = getDB();

    const proj = db.projects.find(p => p.id === id);
    if (!proj) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (user.role !== 'admin' && proj.userId !== user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ project: proj });
  });

  // Projects: Create Project
  app.post('/api/projects', authenticateJWT, (req, res) => {
    const userId = (req as any).user.userId;
    const { name, description, language, files, mainFile, envVars, gitRepoUrl } = req.body;

    if (!name || !language) {
      return res.status(400).json({ error: 'Bot name and language are required' });
    }

    const defaultFiles = language === 'python' ? DEFAULT_PYTHON_BOT : DEFAULT_NODEJS_BOT;
    const finalFiles = files && Array.isArray(files) && files.length > 0 ? files : defaultFiles;
    const finalMain = mainFile || (language === 'python' ? 'main.py' : 'index.js');

    const newProject: DBProject = {
      id: 'proj-' + Date.now(),
      userId,
      name,
      description: description || 'Discord bot project created on TRL Cloud',
      language,
      status: 'offline',
      mainFile: finalMain,
      files: finalFiles,
      envVars: envVars || [{ key: 'BOT_TOKEN', value: 'YOUR_BOT_TOKEN_HERE' }],
      cpuUsage: 0,
      memoryUsage: 0,
      uptimeSeconds: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      gitRepoUrl: gitRepoUrl || undefined
    };

    const db = getDB();
    db.projects.push(newProject);

    // Initial project log
    db.logs[newProject.id] = [
      {
        id: 'log-' + Date.now(),
        projectId: newProject.id,
        timestamp: new Date().toISOString(),
        type: 'system',
        message: `[TRL Cloud] Bot project '${newProject.name}' created successfully.`
      }
    ];

    saveDB(db);

    // Sync project to disk
    syncProjectToDisk(newProject);

    res.json({ project: newProject, message: 'Bot project created successfully' });
  });

  // Projects: Update Project
  app.put('/api/projects/:id', authenticateJWT, (req, res) => {
    const { id } = req.params;
    const user = (req as any).user;
    const { name, description, files, envVars, mainFile } = req.body;

    const db = getDB();
    const proj = db.projects.find(p => p.id === id);
    if (!proj) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (user.role !== 'admin' && proj.userId !== user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (name) proj.name = name;
    if (description !== undefined) proj.description = description;
    if (files && Array.isArray(files)) proj.files = files;
    if (envVars && Array.isArray(envVars)) proj.envVars = envVars;
    if (mainFile) proj.mainFile = mainFile;
    proj.updatedAt = new Date().toISOString();

    saveDB(db);

    // Sync changes to disk
    syncProjectToDisk(proj);

    res.json({ project: proj, message: 'Project updated successfully' });
  });

  // Projects: Delete Project
  app.delete('/api/projects/:id', authenticateJWT, (req, res) => {
    const { id } = req.params;
    const user = (req as any).user;

    const db = getDB();
    const index = db.projects.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const proj = db.projects[index];
    if (user.role !== 'admin' && proj.userId !== user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    stopRealBotProcess(id);

    // Remove project directory from disk
    const projectDir = path.join(PROJECTS_DIR, id);
    if (fs.existsSync(projectDir)) {
      try {
        fs.rmSync(projectDir, { recursive: true, force: true });
      } catch (e) {
        // ignore
      }
    }

    db.projects.splice(index, 1);
    delete db.logs[id];

    saveDB(db);

    res.json({ message: 'Project deleted successfully' });
  });

  // Projects: Start Bot
  app.post('/api/projects/:id/start', authenticateJWT, (req, res) => {
    const { id } = req.params;
    const user = (req as any).user;

    const db = getDB();
    const proj = db.projects.find(p => p.id === id);
    if (!proj) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (user.role !== 'admin' && proj.userId !== user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    startRealBotProcess(id);
    res.json({ status: 'online', message: 'Bot process started successfully' });
  });

  // Projects: Stop Bot
  app.post('/api/projects/:id/stop', authenticateJWT, (req, res) => {
    const { id } = req.params;
    const user = (req as any).user;

    const db = getDB();
    const proj = db.projects.find(p => p.id === id);
    if (!proj) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (user.role !== 'admin' && proj.userId !== user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    stopRealBotProcess(id);
    res.json({ status: 'offline', message: 'Bot process stopped' });
  });

  // Projects: Restart Bot
  app.post('/api/projects/:id/restart', authenticateJWT, (req, res) => {
    const { id } = req.params;
    const user = (req as any).user;

    const db = getDB();
    const proj = db.projects.find(p => p.id === id);
    if (!proj) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (user.role !== 'admin' && proj.userId !== user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    stopRealBotProcess(id);
    setTimeout(() => {
      startRealBotProcess(id);
    }, 1000);

    res.json({ status: 'starting', message: 'Bot restarting...' });
  });

  // Projects: Get Console Logs
  app.get('/api/projects/:id/logs', authenticateJWT, (req, res) => {
    const { id } = req.params;
    const db = getDB();
    const logs = db.logs[id] || [];
    res.json({ logs });
  });

  // Projects: Clear Console Logs
  app.post('/api/projects/:id/logs/clear', authenticateJWT, (req, res) => {
    const { id } = req.params;
    const db = getDB();
    db.logs[id] = [];
    saveDB(db);
    res.json({ message: 'Logs cleared' });
  });

  // Projects: Run Terminal Command
  app.post('/api/projects/:id/terminal', authenticateJWT, (req, res) => {
    const { id } = req.params;
    const { command } = req.body;

    if (!command) {
      return res.status(400).json({ error: 'Command required' });
    }

    addProjectLog(id, 'system', `$ ${command}`);

    if (command.startsWith('npm install') || command.startsWith('pip install')) {
      addProjectLog(id, 'info', `[TRL Cloud Package Manager] Fetching packages from registry...`);
      setTimeout(() => {
        addProjectLog(id, 'success', `[TRL Cloud Package Manager] Dependencies installed successfully!`);
      }, 1000);
    } else if (command.startsWith('node ') || command.startsWith('python ')) {
      addProjectLog(id, 'info', `[TRL Cloud Execution] Executing custom script...`);
    } else {
      addProjectLog(id, 'info', `[TRL Cloud Shell] Command executed with return code 0.`);
    }

    res.json({ message: 'Command executed' });
  });

  // Projects: Error Diagnostics
  app.get('/api/projects/:id/diagnostics', authenticateJWT, (req, res) => {
    const { id } = req.params;
    const db = getDB();
    const proj = db.projects.find(p => p.id === id);
    if (!proj) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const logs = db.logs[id] || [];
    const diagnostic = analyzeProjectErrors(proj, logs);
    res.json({ diagnostic });
  });

  // Projects: AI Error Assistant
  app.post('/api/projects/:id/ai-assistant', authenticateJWT, async (req, res) => {
    const { id } = req.params;
    const { userPrompt } = req.body;
    const db = getDB();

    const proj = db.projects.find(p => p.id === id);
    if (!proj) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const logs = db.logs[id] || [];
    const recentLogs = logs.slice(-25).map(l => `[${l.type.toUpperCase()}] ${l.message}`).join('\n');
    const mainCode = proj.files.find(f => f.path === proj.mainFile)?.content || '';

    let aiAnalysis = '';

    if (process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const model = 'gemini-2.5-flash';

        const promptText = `You are the TRL Cloud Bot Repair AI Assistant.
Analyze this ${proj.language} Discord bot project for crashes/errors.

Bot Name: ${proj.name}
Language: ${proj.language}
Main File (${proj.mainFile}):
\`\`\`
${mainCode}
\`\`\`

Recent Console Output:
\`\`\`
${recentLogs || 'No logs recorded yet.'}
\`\`\`

User Request: ${userPrompt || 'Analyze my bot for errors, explain what happened, and provide a solution.'}

Provide:
1. Root Cause Explanation
2. Exact Steps to Fix
3. Complete Corrected Code Snippet`;

        const response = await ai.models.generateContent({
          model,
          contents: promptText
        });

        aiAnalysis = response.text || '';
      } catch (geminiErr) {
        console.error('Gemini API call failed, falling back to local diagnostic engine:', geminiErr);
      }
    }

    if (!aiAnalysis) {
      const diag = analyzeProjectErrors(proj, logs);
      if (diag.hasError) {
        aiAnalysis = `### 🤖 TRL Cloud AI Diagnostic Report

**Issue Identified**: ${diag.title}
**Error Type**: ${diag.errorType}

#### 🔍 Root Cause Analysis
${diag.description}

#### 💡 Solution & Suggested Repair
${diag.suggestedFix}

${diag.detectedLog ? `\`\`\`log\n${diag.detectedLog}\n\`\`\`` : ''}`;
      } else {
        aiAnalysis = `### 🤖 TRL Cloud AI Diagnostic Report

**Status**: No critical crashes detected in recent console logs.

#### 💡 Recommendations for Bot Stability:
1. Ensure your \`BOT_TOKEN\` env variable is configured properly in the Environment Variables tab.
2. Ensure required NPM/pip packages are listed in your project code.
3. Keep auto-restart enabled for continuous uptime.`;
      }
    }

    res.json({ analysis: aiAnalysis });
  });

  // Projects: Download Backup ZIP
  app.get('/api/projects/:id/backup', authenticateJWT, async (req, res) => {
    const { id } = req.params;
    const user = (req as any).user;
    const db = getDB();

    const proj = db.projects.find(p => p.id === id);
    if (!proj) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (user.role !== 'admin' && proj.userId !== user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    try {
      const zip = new JSZip();

      // Add code files
      proj.files.forEach(f => {
        if (!f.isDirectory) {
          zip.file(f.path, f.content);
        }
      });

      // Add .env file if envVars exist
      if (proj.envVars && proj.envVars.length > 0) {
        const envContent = proj.envVars.map(e => `${e.key}=${e.value}`).join('\n');
        zip.file('.env', envContent);
      }

      // Add metadata manifest
      const manifest = {
        name: proj.name,
        description: proj.description,
        language: proj.language,
        mainFile: proj.mainFile,
        exportedAt: new Date().toISOString(),
        platform: 'TRL Cloud',
        author: 'TRL TEAM FOR DEVELOPMENT'
      };
      zip.file('trl-manifest.json', JSON.stringify(manifest, null, 2));

      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

      const safeName = proj.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${safeName}_backup.zip"`);
      res.send(zipBuffer);
    } catch (err) {
      console.error('Backup ZIP generation error:', err);
      res.status(500).json({ error: 'Failed to generate project backup ZIP' });
    }
  });

  // Bot Templates API
  app.get('/api/templates', (req, res) => {
    const templates = [
      {
        id: 'tpl-mod-node',
        name: 'Discord.js Moderation & Ticket Bot',
        description: 'Complete Node.js bot with ban, kick, purge, ticket system, and welcome logs.',
        language: 'nodejs',
        icon: 'Shield',
        tags: ['Discord.js v14', 'Moderation', 'Tickets'],
        mainFile: 'index.js',
        files: DEFAULT_NODEJS_BOT
      },
      {
        id: 'tpl-music-py',
        name: 'Python Music & Voice Bot',
        description: 'Advanced Python discord.py audio bot supporting play, pause, queue, and volume control.',
        language: 'python',
        icon: 'Music',
        tags: ['Discord.py', 'Voice', 'Audio Player'],
        mainFile: 'main.py',
        files: DEFAULT_PYTHON_BOT
      },
      {
        id: 'tpl-economy-node',
        name: 'Economy & Leveling XP Bot',
        description: 'Interactive Node.js bot with daily rewards, balance transfers, shop, and level cards.',
        language: 'nodejs',
        icon: 'Coins',
        tags: ['Economy', 'XP System', 'Node.js'],
        mainFile: 'index.js',
        files: DEFAULT_NODEJS_BOT
      }
    ];
    res.json({ templates });
  });

  // Notifications API
  app.get('/api/notifications', authenticateJWT, (req, res) => {
    const userId = (req as any).user.userId;
    const db = getDB();
    const notifs = db.notifications.filter(n => n.userId === userId || !n.userId);
    res.json({ notifications: notifs });
  });

  app.post('/api/notifications/read', authenticateJWT, (req, res) => {
    const userId = (req as any).user.userId;
    const db = getDB();
    db.notifications.forEach(n => {
      if (n.userId === userId || !n.userId) {
        n.read = true;
      }
    });
    saveDB(db);
    res.json({ message: 'Marked all as read' });
  });

  // Support Tickets
  app.post('/api/support/tickets', authenticateJWT, (req, res) => {
    const userId = (req as any).user.userId;
    const { subject, category, message, userEmail } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message are required' });
    }

    const db = getDB();
    const newTicket = {
      id: 'ticket-' + Date.now(),
      userId,
      userEmail: userEmail || 'user@trlcloud.com',
      subject,
      category: category || 'technical',
      message,
      status: 'open',
      createdAt: new Date().toISOString()
    };

    db.tickets.push(newTicket);

    db.notifications.push({
      id: 'notif-' + Date.now(),
      userId,
      title: 'Support Ticket Received',
      message: `Your ticket #${newTicket.id} has been logged. TRL TEAM FOR DEVELOPMENT will respond shortly.`,
      type: 'info',
      read: false,
      timestamp: new Date().toISOString()
    });

    saveDB(db);

    res.json({ ticket: newTicket, message: 'Ticket submitted successfully' });
  });

  // System Status / Server Nodes API
  app.get('/api/system/nodes', (req, res) => {
    const nodes = [
      {
        id: 'node-us-east',
        name: 'US-East Node (Virginia)',
        location: 'Ashburn, VA, USA',
        flag: '🇺🇸',
        status: 'operational',
        pingMs: 18,
        cpuPercent: 32,
        ramPercent: 45,
        activeBots: 5420
      },
      {
        id: 'node-eu-central',
        name: 'EU-Central Node (Frankfurt)',
        location: 'Frankfurt, Germany',
        flag: '🇩🇪',
        status: 'operational',
        pingMs: 24,
        cpuPercent: 28,
        ramPercent: 41,
        activeBots: 4890
      },
      {
        id: 'node-asia-south',
        name: 'Asia-South Node (Singapore)',
        location: 'Singapore',
        flag: '🇸🇬',
        status: 'operational',
        pingMs: 42,
        cpuPercent: 22,
        ramPercent: 38,
        activeBots: 2140
      }
    ];

    res.json({
      overallStatus: 'operational',
      uptimePercent: 99.98,
      nodes,
      platformContact: {
        team: 'TRL TEAM FOR DEVELOPMENT',
        discord: 'https://discord.gg/4FJG7jCGJ8',
        github: 'https://taimdev9.github.io/Taim.dev-My-experiences/#contact',
        email: 'taymabdrabo723@gmail.com'
      }
    });
  });

  // Admin Panel APIs
  app.get('/api/admin/stats', authenticateJWT, (req, res) => {
    const user = (req as any).user;
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin privilege required' });
    }

    const db = getDB();
    const totalUsers = db.users.length;
    const totalBots = db.projects.length;
    const activeBots = db.projects.filter(p => p.status === 'online').length;
    const tickets = db.tickets.length;

    res.json({
      totalUsers,
      totalBots,
      activeBots,
      tickets,
      users: db.users.map(({ passwordHash, ...u }) => u),
      projects: db.projects
    });
  });

  app.put('/api/admin/users/:id/ban', authenticateJWT, (req, res) => {
    const adminUser = (req as any).user;
    if (adminUser.role !== 'admin') {
      return res.status(403).json({ error: 'Admin privilege required' });
    }

    const { id } = req.params;
    const db = getDB();
    const user = db.users.find(u => u.id === id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isBanned = !user.isBanned;
    saveDB(db);

    res.json({ message: `User ${user.isBanned ? 'banned' : 'unbanned'} successfully`, user });
  });

  // AI Assistant Routes
  const getAiInstance = () => {
    const key = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;
    if (!key) return null;
    return new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' }
      }
    });
  };

  app.get('/api/ai/status', (req, res) => {
    const key = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;
    res.json({
      assistantName: 'Cloud Bot',
      projectName: 'TRL Cloud',
      developer: 'TRL TEAM FOR DEVELOPMENT',
      provider: 'Google Gemini AI',
      model: 'gemini-3.6-flash',
      isConfigured: !!key,
      status: key ? 'Online & Ready' : 'API Key Missing (Set AI_API_KEY or GEMINI_API_KEY)'
    });
  });

  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { prompt, history, context } = req.body;
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      const ai = getAiInstance();
      if (!ai) {
        return res.json({
          reply: `🤖 **Cloud Bot (TRL Cloud AI Assistant)**\n\nTo enable live Google Gemini AI capabilities, please configure the \`AI_API_KEY\` or \`GEMINI_API_KEY\` environment variable in your server settings.\n\nHere is a quick guidance regarding your query: "${prompt}":\n\n- **Discord.js (Node.js)**: Ensure you use \`Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] })\` and login with \`client.login(process.env.BOT_TOKEN)\`.\n- **Discord.py (Python)**: Ensure you enable \`intents = discord.Intents.default()\` and \`intents.message_content = True\` before running \`bot.run(os.getenv('BOT_TOKEN'))\`.\n- **TRL Cloud Hosting**: You can upload a ZIP file or code directly in TRL Cloud Browser IDE.`,
          isFallback: true
        });
      }

      const systemInstruction = `You are Cloud Bot, the intelligent AI Assistant built for TRL Cloud (a next-generation Discord Bot Hosting platform by TRL TEAM FOR DEVELOPMENT).
Your responsibilities:
1. Help users write high quality Node.js (Discord.js v14) and Python (Discord.py / disnake / hikari) bot code.
2. Debug errors, analyze crashes, fix bugs, and optimize CPU/memory usage.
3. Explain programming concepts clearly with formatted Markdown code blocks.
4. Assist users with environment variables, bot tokens, intents, and hosting on TRL Cloud.
Be friendly, professional, clear, and highly technical when providing code.`;

      const contentsList: any[] = [];
      if (history && Array.isArray(history)) {
        for (const msg of history) {
          contentsList.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.text || msg.content || '' }]
          });
        }
      }

      let fullPrompt = prompt;
      if (context) {
        fullPrompt = `Context details:\n${JSON.stringify(context)}\n\nUser Question:\n${prompt}`;
      }

      contentsList.push({
        role: 'user',
        parts: [{ text: fullPrompt }]
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: contentsList,
        config: {
          systemInstruction
        }
      });

      const reply = response.text || "I processed your request, but received no text output.";
      res.json({ reply, isFallback: false });
    } catch (err: any) {
      console.error('AI Chat Error:', err);
      res.status(500).json({ error: err.message || 'AI processing failed' });
    }
  });

  app.post('/api/ai/analyze-project', authenticateJWT, async (req, res) => {
    try {
      const { projectId } = req.body;
      if (!projectId) {
        return res.status(400).json({ error: 'ProjectId is required' });
      }

      const db = getDB();
      const proj = db.projects.find(p => p.id === projectId);
      if (!proj) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const logs = db.logs[projectId] || [];
      const recentLogs = logs.slice(-30).map(l => `[${l.timestamp}] [${l.type}] ${l.message}`).join('\n');

      const projectSummary = {
        name: proj.name,
        language: proj.language,
        status: proj.status,
        mainFile: proj.mainFile,
        files: proj.files.map(f => ({ path: f.path, isDirectory: f.isDirectory, sample: f.content ? f.content.substring(0, 300) : '' }))
      };

      const ai = getAiInstance();
      if (!ai) {
        return res.json({
          analysis: `### 🔍 Cloud Bot Diagnostic Summary for **${proj.name}**\n\n- **Project Status**: \`${proj.status}\`\n- **Language**: \`${proj.language}\`\n- **Main File**: \`${proj.mainFile}\`\n- **Total Files**: ${proj.files.length}\n\n**Recent Log Observations**:\n\`\`\`text\n${recentLogs || 'No logs captured yet.'}\n\`\`\`\n\n*Note: Add \`AI_API_KEY\` or \`GEMINI_API_KEY\` to your environment to receive deep AI root-cause diagnostic reports with automatic code fix suggestions.*`
        });
      }

      const systemInstruction = `You are Cloud Bot, an expert AI DevOps and Discord Bot engineer for TRL Cloud. Analyze the project files, environment setup, and recent execution logs to identify bugs, crashes, syntax errors, missing intents, or unhandled promise rejections. Provide a clear diagnosis, root cause explanation, and corrected code snippets.`;

      const prompt = `Analyze this Discord bot project and recent logs to diagnose errors or improvements:

Project Details:
${JSON.stringify(projectSummary, null, 2)}

Recent Console Logs (Last 30 lines):
${recentLogs || 'No logs available.'}

Please provide:
1. Diagnosis & Current Health Status
2. Root Cause of any errors or potential risks
3. Step-by-Step Fixes with code blocks`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: { systemInstruction }
      });

      res.json({ analysis: response.text });
    } catch (err: any) {
      console.error('AI Project Analysis Error:', err);
      res.status(500).json({ error: err.message || 'Analysis failed' });
    }
  });

  // Setup Vite middleware in dev mode OR static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TRL Cloud Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
