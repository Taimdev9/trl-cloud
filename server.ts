import express from 'express';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import JSZip from 'jszip';
import { createServer as createViteServer } from 'vite';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
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
  isVerified?: boolean;
  verificationCode?: string;
  verificationExpires?: string;
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

// Email sending helper
async function sendVerificationEmail(email: string, code: string) {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || '"TRL Cloud" <no-reply@trlcloud.com>';

  console.log(`\n=============================================================`);
  console.log(`[TRL EMAIL VERIFICATION CODE]`);
  console.log(`Target Email: ${email}`);
  console.log(`6-Digit Verification Code: ${code}`);
  console.log(`Expires in: 15 minutes`);
  console.log(`=============================================================\n`);

  if (host && user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
      });

      await transporter.sendMail({
        from,
        to: email,
        subject: '🔐 TRL Cloud - Verify Your Account Code: ' + code,
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #0b0f19; padding: 30px; color: #ffffff;">
            <div style="max-width: 500px; margin: 0 auto; background-color: #111827; border-radius: 16px; padding: 24px; border: 1px solid #374151;">
              <h2 style="color: #6366f1; margin-top: 0;">⚡ TRL Cloud Verification</h2>
              <p style="color: #d1d5db; font-size: 14px;">Welcome to TRL Cloud! Enter the following 6-digit code to verify your email and activate your Discord bot hosting workspace:</p>
              <div style="background-color: #1f2937; padding: 16px; border-radius: 12px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #10b981; margin: 20px 0;">
                ${code}
              </div>
              <p style="color: #9ca3af; font-size: 12px;">This code expires in 15 minutes. If you did not create a TRL Cloud account, please ignore this message.</p>
              <hr style="border: none; border-top: 1px solid #374151; margin: 20px 0;" />
              <p style="color: #6b7280; font-size: 11px; text-align: center;">TRL TEAM FOR DEVELOPMENT &copy; 2026</p>
            </div>
          </div>
        `
      });
      console.log(`[TRL Email Verification] Real SMTP email sent successfully to ${email}`);
    } catch (err) {
      console.error(`[TRL Email Verification] SMTP Email sending failed:`, err);
    }
  }
}

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

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser: DBUser = {
      id: 'usr-' + Date.now(),
      username,
      email: email.toLowerCase(),
      passwordHash,
      role: 'user',
      language: language || 'en',
      createdAt: new Date().toISOString(),
      isVerified: false,
      verificationCode,
      verificationExpires
    };

    db.users.push(newUser);

    // Create welcome notification
    db.notifications.push({
      id: 'notif-' + Date.now(),
      userId: newUser.id,
      title: 'Welcome to TRL Cloud',
      message: 'Account created! Please verify your email code to activate bot hosting.',
      type: 'info',
      read: false,
      timestamp: new Date().toISOString()
    });

    saveDB(db);

    // Send verification code email/log
    await sendVerificationEmail(newUser.email, verificationCode);

    res.json({
      requireVerification: true,
      email: newUser.email,
      message: 'Registration successful! A 6-digit verification code has been sent to your email.',
      codeForDemo: verificationCode
    });
  });

  // Auth: Verify Email Code
  app.post('/api/auth/verify-email', async (req, res) => {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and verification code are required' });
    }

    const db = getDB();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isVerified) {
      const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      const { passwordHash: _, verificationCode: __, verificationExpires: ___, ...safeUser } = user;
      return res.json({ token, user: safeUser, message: 'Account is already verified!' });
    }

    if (!user.verificationCode || user.verificationCode !== String(code).trim()) {
      return res.status(400).json({ error: 'Invalid 6-digit verification code' });
    }

    if (user.verificationExpires && new Date(user.verificationExpires) < new Date()) {
      return res.status(400).json({ error: 'Verification code has expired. Please click Resend Code.' });
    }

    user.isVerified = true;
    delete user.verificationCode;
    delete user.verificationExpires;
    saveDB(db);

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const { passwordHash: _, verificationCode: __, verificationExpires: ___, ...safeUser } = user;

    res.json({ token, user: safeUser, message: 'Email verified successfully! Welcome to TRL Cloud.' });
  });

  // Auth: Resend Code
  app.post('/api/auth/resend-code', async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const db = getDB();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    user.verificationCode = verificationCode;
    user.verificationExpires = verificationExpires;
    saveDB(db);

    await sendVerificationEmail(user.email, verificationCode);

    res.json({
      message: 'New 6-digit verification code sent successfully!',
      codeForDemo: verificationCode
    });
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

    // Check if verified
    if (user.isVerified === false) {
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      user.verificationCode = verificationCode;
      user.verificationExpires = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      saveDB(db);

      await sendVerificationEmail(user.email, verificationCode);

      return res.status(403).json({
        requireVerification: true,
        email: user.email,
        error: 'Email verification required. A 6-digit code has been sent to your email.',
        codeForDemo: verificationCode
      });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const { passwordHash: _, verificationCode: __, verificationExpires: ___, ...safeUser } = user;

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
