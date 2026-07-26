export type Language = 'en' | 'ar' | 'fr';

export type BotLanguage = 'nodejs' | 'python' | 'java' | 'csharp';

export type BotStatus = 'online' | 'offline' | 'error' | 'starting' | 'installing';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  language: Language;
  createdAt: string;
}

export interface BotFile {
  path: string;
  content: string;
  isDirectory?: boolean;
}

export interface EnvVariable {
  key: string;
  value: string;
}

export interface BotProject {
  id: string;
  userId: string;
  name: string;
  description: string;
  language: BotLanguage;
  status: BotStatus;
  mainFile: string;
  files: BotFile[];
  envVars: EnvVariable[];
  cpuUsage: number; // percentage
  memoryUsage: number; // MB
  uptimeSeconds: number;
  lastStartedAt?: string;
  createdAt: string;
  updatedAt: string;
  gitRepoUrl?: string;
}

export interface LogEntry {
  id: string;
  projectId: string;
  timestamp: string;
  type: 'info' | 'warn' | 'error' | 'success' | 'system';
  message: string;
}

export interface SystemNode {
  id: string;
  name: string;
  location: string;
  flag: string;
  status: 'operational' | 'degraded' | 'maintenance';
  pingMs: number;
  cpuPercent: number;
  ramPercent: number;
  activeBots: number;
}

export interface BotTemplate {
  id: string;
  name: string;
  description: string;
  language: BotLanguage;
  icon: string;
  tags: string[];
  files: BotFile[];
  mainFile: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  subject: string;
  category: 'technical' | 'billing' | 'feature' | 'other';
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
}
