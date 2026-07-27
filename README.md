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

- 🔐 **Instant Simple Registration & Authentication**:
  - **Username + Password** registration with instant account activation.
  - **Continue with Google**: Instant 1-click Google account login & auto-provisioning.
  - **Terms & Privacy Checkbox**: Custom modern interactive Terms agreement check before account creation.
  - **No Email Verification Codes**: Fast, hassle-free onboarding without SMTP or verification codes.
  - Secure JWT authentication with bcrypt password hashing.

- 💻 **Supported Bot Languages**:
  - **JavaScript (Node.js)**: Discord.js v14 ready.
  - **Python**: discord.py / disnake ready.

- 📊 **Real-time Bot Controls & Persistence**:
  - Start, Stop, and Restart bot instances.
  - Live console streaming logs with search, auto-scroll, and log clearing.
  - Permanent project state & backup .ZIP downloads.
  - Environment Variables / Secrets Manager (`BOT_TOKEN`, `CLIENT_SECRET`, etc.).
  - Resource meters for CPU, Memory (RAM), and Uptime.

- 🤖 **AI Error Assistant & Diagnostics**:
  - Automatic error detection engine for crashes, syntax errors, and missing packages.
  - Integrated AI Assistant providing automated root-cause analysis and code repair snippets.

- 🛠️ **Admin Panel**:
  - Monitor global registered users, active bots, and server node load.
  - Ban / Unban user accounts and force-stop misbehaving bot projects.

---

## 👨‍💻 Developed By

**TRL TEAM FOR DEVELOPMENT**

Contact Details:
- **Discord Server**: [https://discord.gg/4FJG7jCGJ8](https://discord.gg/4FJG7jCGJ8)
- **GitHub Portfolio**: [https://taimdev9.github.io/Taim.dev-My-experiences/#contact](https://taimdev9.github.io/Taim.dev-My-experiences/#contact)
- **Email**: taymabdrabo723@gmail.com

---

## 🛠️ Environment Variables Setup

TRL Cloud requires minimal configuration to deploy on Render or Cloud environments:

| Environment Variable | Required | Description | Example |
|---|---|---|---|
| `JWT_SECRET` | Yes | JWT Signing Key | `trl-cloud-jwt-secret-key` |
| `GEMINI_API_KEY` | Optional | Gemini API key for AI Error Assistant | `AIzaSy...` |
| `PORT` | Auto | Bind Port (Render sets this automatically) | `3000` |

*(Note: No SMTP, CAPTCHA, or external database setup required).*

---

## 🚀 Render Deployment Instructions

TRL Cloud is fully pre-configured for deployment on **Render.com**.

### 1. Web Service Configuration on Render
1. Go to your Render Dashboard and create a **New Web Service**.
2. Connect your GitHub repository.
3. Configure the build settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Node Version**: `18.x` or higher

### 2. Configure Environment Variables in Render
In the **Environment** tab of your Render Web Service, add:
- `JWT_SECRET` = `your-custom-jwt-secret`
- `GEMINI_API_KEY` = *(optional for AI Bot Assistant)*

Render automatically sets the `PORT` variable (e.g., `10000`), which `server.ts` automatically binds to `0.0.0.0`.

---

## 📜 License

Created by **TRL TEAM FOR DEVELOPMENT**. All rights reserved.
