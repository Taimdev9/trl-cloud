# TRL Cloud - Discord Bot Hosting Platform

**TRL Cloud** is a Discord Bot Hosting Platform created by **TRL TEAM FOR DEVELOPMENT**.

It allows users to create, upload, manage, edit, and host Node.js and Python Discord bots in a modern cloud dashboard.

---

## ⚡ Features

- 🚀 **Multi-Method Bot Deployment**:
  1. **Upload .ZIP File**: Automatically extracts and detects project structure.
  2. **Manual File Upload**: Drag and drop JavaScript/Python source files.
  3. **In-Browser Code IDE**: Full-featured code editor with file tree explorer, file creation, tab navigation, and live terminal simulation.
  4. **GitHub Import**: Connect public or private GitHub repository URLs.

- 🌐 **Multilingual Support (3 Languages)**:
  - English 🇺🇸
  - Arabic 🇸🇦 (with RTL direction & clean alignment)
  - French 🇫🇷

- 🔐 **User Account System**:
  - Secure JWT authentication with bcrypt password hashing.
  - User profiles, role-based access control (User / Admin), and settings.

- 💻 **Supported Bot Languages**:
  - **JavaScript (Node.js)**: Discord.js v14 ready.
  - **Python**: discord.py / disnake ready.

- 📊 **Real-time Bot Controls**:
  - Start, Stop, and Restart bot instances.
  - Live console streaming logs with search, auto-scroll, and log clearing.
  - Environment Variables / Secrets Manager (`BOT_TOKEN`, `CLIENT_SECRET`, etc.).
  - Resource meters for CPU, Memory (RAM), and Uptime.

- 🛠️ **Admin Panel**:
  - Monitor global registered users, active bots, and server node load.
  - Ban / Unban user accounts and force-stop misbehaving bot projects.

- 📖 **Docs & Support**:
  - Interactive System Status page for cloud infrastructure nodes.
  - Developer documentation guides and support ticket submission.

---

## 👨‍💻 Developed By

**TRL TEAM FOR DEVELOPMENT**

Contact Details:
- **Discord Server**: [https://discord.gg/4FJG7jCGJ8](https://discord.gg/4FJG7jCGJ8)
- **GitHub Portfolio**: [https://taimdev9.github.io/Taim.dev-My-experiences/#contact](https://taimdev9.github.io/Taim.dev-My-experiences/#contact)
- **Email**: taymabdrabo723@gmail.com

---

## 🛠️ Deployment Instructions

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/trl-cloud.git
   cd trl-cloud
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

### Deploying to Render

This repository includes a `render.yaml` blueprint file.
1. Connect your repository to Render.
2. Select **New Web Service** or import `render.yaml`.
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`

---

## 📜 License

Created by **TRL TEAM FOR DEVELOPMENT**. All rights reserved.
