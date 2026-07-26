import express from 'express';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'trl-cloud-super-secret-jwt-key-2026';
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
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
          createdAt: new Date().toISOString()
        },
        {
          id: 'user-01',
          username: 'TRLDeveloper',
          email: 'user@trlcloud.com',
          passwordHash: userPasswordHash,
          role: 'user',
          language: 'en',
          createdAt: new Date().toISOString()
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

// Simulated active running timers for bot logs
const activeBotIntervals: Record<string, NodeJS.Timeout> = {};

function startBotSimulation(projectId: string) {
  const db = getDB();
  const proj = db.projects.find(p => p.id === projectId);
  if (!proj) return;

  proj.status = 'online';
  proj.cpuUsage = +(Math.random() * 2 + 0.5).toFixed(1);
  proj.memoryUsage = Math.floor(Math.random() * 20 + 35);
  proj.lastStartedAt = new Date().toISOString();
  saveDB(db);

  // Add startup log
  addProjectLog(projectId, 'system', `[TRL Cloud Engine] Starting bot container process for '${proj.name}' (${proj.language})...`);
  setTimeout(() => {
    addProjectLog(projectId, 'info', `[TRL Cloud Engine] Executing main entry file: ${proj.mainFile}`);
    addProjectLog(projectId, 'success', `[TRL Cloud Engine] Bot initialized and connected to Discord Gateway WebSocket!`);
  }, 1200);

  if (activeBotIntervals[projectId]) {
    clearInterval(activeBotIntervals[projectId]);
  }

  // Periodic heartbeat log simulation
  activeBotIntervals[projectId] = setInterval(() => {
    const currentDB = getDB();
    const currentProj = currentDB.projects.find(p => p.id === projectId);
    if (!currentProj || currentProj.status !== 'online') {
      clearInterval(activeBotIntervals[projectId]);
      delete activeBotIntervals[projectId];
      return;
    }

    currentProj.uptimeSeconds += 15;
    currentProj.cpuUsage = +(Math.random() * 3 + 0.3).toFixed(1);
    currentProj.memoryUsage = Math.floor(Math.random() * 10 + 40);
    saveDB(currentDB);

    const events = [
      `[Discord Gateway] Heartbeat ACK (Latency: ${Math.floor(Math.random() * 30 + 15)}ms)`,
      `[TRL Bot Event] Command /ping executed in Guild #${Math.floor(Math.random() * 100 + 10)}`,
      `[TRL Bot Stats] Cache sync complete. Active guild members: ${Math.floor(Math.random() * 5000 + 1200)}`,
      `[TRL Memory Guard] Memory usage stable at ${currentProj.memoryUsage}MB / 512MB.`
    ];

    const randomMsg = events[Math.floor(Math.random() * events.length)];
    addProjectLog(projectId, 'info', randomMsg);
  }, 15000);
}

function stopBotSimulation(projectId: string) {
  if (activeBotIntervals[projectId]) {
    clearInterval(activeBotIntervals[projectId]);
    delete activeBotIntervals[projectId];
  }

  const db = getDB();
  const proj = db.projects.find(p => p.id === projectId);
  if (proj) {
    proj.status = 'offline';
    proj.cpuUsage = 0;
    proj.memoryUsage = 0;
    saveDB(db);
    addProjectLog(projectId, 'warn', `[TRL Cloud Engine] SIGTERM signal sent. Bot process stopped by user.`);
  }
}

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
  app.post('/api/auth/register', async (req, res) => {
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
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);

    // Create welcome notification
    db.notifications.push({
      id: 'notif-' + Date.now(),
      userId: newUser.id,
      title: 'Welcome to TRL Cloud',
      message: 'Account created! Create your first Discord bot project or test our template bots.',
      type: 'success',
      read: false,
      timestamp: new Date().toISOString()
    });

    saveDB(db);

    const token = jwt.sign({ userId: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
    const { passwordHash: _, ...safeUser } = newUser;

    res.json({ token, user: safeUser });
  });

  // Auth: Login
  app.post('/api/auth/login', async (req, res) => {
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

    stopBotSimulation(id);
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

    startBotSimulation(id);
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

    stopBotSimulation(id);
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

    stopBotSimulation(id);
    setTimeout(() => {
      startBotSimulation(id);
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
