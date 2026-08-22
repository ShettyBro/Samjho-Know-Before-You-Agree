# Samjho — Know Before You Agree

> **AI-powered consent & agreement analyzer** — paste text, upload a PDF, or use the browser extension to instantly understand what you're agreeing to, in English, Hindi, or Kannada.

<p align="center">
  <img src="https://img.shields.io/badge/status-live-brightgreen?style=for-the-badge" />
  <img src="https://img.shields.io/badge/tests-397%20passing-success?style=for-the-badge" />
  <img src="https://img.shields.io/badge/AI-Gemini-blue?style=for-the-badge&logo=google" />
  <img src="https://img.shields.io/badge/deploy-AWS%20Elastic%20Beanstalk-orange?style=for-the-badge&logo=amazonaws" />
  <img src="https://img.shields.io/badge/frontend-Vercel-black?style=for-the-badge&logo=vercel" />
</p>

---

## 🔗 Live Links

| Service | URL |
|---|---|
| 🌐 Web App (Frontend) | [samjho-know-before-you-agree-fronte.vercel.app](https://samjho-know-before-you-agree-fronte.vercel.app) |
| ⚙️ Backend API | [api1.sudeepbro.works](https://api1.sudeepbro.works) |

---

## 📖 What is Samjho?

**Samjho** (Hindi: *समझो*, "Understand") is a tool that makes dense legal agreements — Terms of Service, Privacy Policies, EULAs — actually readable.

It uses Google Gemini to:
- **Identify attention items** — clauses you should actually care about
- **Summarize** the agreement in plain language
- **Ground every finding** with source quotes from the original document
- **Detect changes** if you've seen this agreement before
- **Answer follow-up questions** via "Ask Samjho" chat

Supports **English**, **Hindi (हिंदी)**, and **Kannada (ಕನ್ನಡ)**.

---

## 🏗️ Architecture

This is an **npm workspaces monorepo** with three packages:

```
samjho/
├── backend/       # Node.js + Express REST API (TypeScript)
├── frontend/      # React + Vite web app (TypeScript)
└── extension/     # Chrome browser extension (TypeScript)
```

### Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express, TypeScript |
| Frontend | React 18, Vite, Framer Motion |
| AI | Google Gemini (`gemini-3.1-flash-lite`) |
| Database | Neon Postgres (serverless) |
| Auth | JWT sessions (bcrypt passwords) |
| Extension | Chrome MV3, Content Scripts |
| Deploy — API | AWS Elastic Beanstalk (Docker, `ap-south-1`) |
| Deploy — Web | Vercel |

---

## ✨ Features

### Web App
- **Paste text** — drop any ToS/agreement text directly
- **PDF upload** — up to 8MB, memory-only extraction
- **Multi-language UI** — English / Hindi / Kannada toggle
- **Auth** — register, login, sessions (JWT)
- **History** — revisit past analyses
- **Saved agreements** — bookmark important ones
- **Change detection** — SHA-256 hash-based, detects if an agreement you've seen before has changed
- **Ask Samjho** — grounded follow-up chat with prompt-injection defenses
- **Glassmorphic design** — moondust-gold (`#ebcc90`) theme with dark mode

### Browser Extension (Chrome MV3)
- Auto-detects consent dialogs, ToS links, checkboxes, and body text on any page
- MutationObserver-driven for SPAs and dynamically loaded content
- Side panel + in-page popup in all 3 languages
- **Self-aware** — skips Samjho's own web app (via `<meta name="samjho-web-app">` marker)
- Iframe rendering fallback for same-origin documents

### Backend API
- Structured Gemini analysis with schema validation and source grounding
- Chunked long-document handling (up to 96,000 characters, honest disclosure beyond)
- Shared in-memory analysis cache with in-flight deduplication
- Provider-error cooldown (no retry storms)
- `/health` endpoint (Elastic Beanstalk compatible)
- Dockerized, multi-stage build

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js 20+
- npm 10+

### 1. Clone & Install

```bash
git clone https://github.com/sudeepbro/Samjho-Know-Before-You-Agree.git
cd Samjho-Know-Before-You-Agree
npm install
```

### 2. Configure Backend

Create `backend/.env`:

```env
NODE_ENV=development
PORT=4000
CORS_ORIGINS=http://localhost:5173
DATABASE_URL=your_neon_postgres_connection_string
AUTH_JWT_SECRET=your_secure_random_secret
ANALYSIS_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.1-flash-lite
```

> Generate a secure `AUTH_JWT_SECRET` with:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

### 3. Configure Frontend

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:4000
```

### 4. Run Dev Servers

```bash
# Backend (port 4000)
npm run dev:backend

# Frontend (port 5173)
npm run dev:frontend

# Extension (watch mode)
npm run dev:extension
```

### 5. Load Extension in Chrome

1. Build the extension: `npm run build:extension`
2. Open Chrome → `chrome://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked** → select `extension/dist/`

---

## 🗄️ Database Schema

Three Postgres tables (managed via raw SQL, schema in `backend/src/db/schema.ts`):

| Table | Purpose |
|---|---|
| `users` | Auth — email, bcrypt-hashed password |
| `agreement_history` | Per-user analysis history with content hashes |
| `saved_agreements` | Bookmarked agreements |

> If `DATABASE_URL` is not set, the backend automatically falls back to an **in-memory store** (data lost on restart) — useful for quick local testing without a database.

---

## 🐳 Docker (Backend)

Build from the **monorepo root** (required for workspace dependency resolution):

```bash
docker build -f backend/Dockerfile -t samjho-backend .
docker run -p 4000:4000 --env-file backend/.env samjho-backend
```

---

## 🌐 Deployment

### Backend — AWS Elastic Beanstalk

Environment: `Samjao-env` · Region: `ap-south-1` · Platform: Docker on Amazon Linux 2023

Set these environment variables in EB:

```
NODE_ENV=production
PORT=4000
CORS_ORIGINS=https://samjho-know-before-you-agree-fronte.vercel.app
DATABASE_URL=<neon_connection_string>
AUTH_JWT_SECRET=<secure_secret>
ANALYSIS_PROVIDER=gemini
GEMINI_API_KEY=<your_key>
GEMINI_MODEL=gemini-3.1-flash-lite
```

Update via AWS CLI:
```bash
aws elasticbeanstalk update-environment \
  --region ap-south-1 \
  --environment-name Samjao-env \
  --option-settings Namespace=aws:elasticbeanstalk:application:environment,OptionName=KEY,Value=VALUE
```

### Frontend — Vercel

Set in Vercel project settings:
```
VITE_API_BASE_URL=https://api1.sudeepbro.works
```

---

## 🧪 Tests

```bash
# Backend — 228 tests
cd backend && npm test

# Frontend — 30 tests
cd frontend && npm test

# Extension — 139 tests
cd extension && npm test
```

**Total: 397 / 397 passing** ✅

---

## 📡 API Reference

Base URL: `https://api1.sudeepbro.works`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/api/v1/agreements/text` | Analyze pasted text |
| `POST` | `/api/v1/agreements/pdf` | Analyze PDF |
| `POST` | `/api/v1/agreements/web/text` | Web extension text analysis |
| `POST` | `/api/v1/chat` | Ask Samjho follow-up chat |
| `POST` | `/api/v1/auth/register` | Register account |
| `POST` | `/api/v1/auth/login` | Login |
| `POST` | `/api/v1/auth/logout` | Logout |
| `GET` | `/api/v1/auth/me` | Current session |
| `GET` | `/api/v1/history` | Analysis history |
| `GET` | `/api/v1/agreements/saved` | Saved agreements |

---

## ⚠️ Known Limitations

- Web paste/PDF version tracking cannot follow an edited resubmission (content-derived identity)
- Extension has no login UI — history/saved is web-app only
- Real TTS/audio is an unimplemented placeholder
- No OCR, second AI provider, semantic diffing, or notifications

---

## 👥 Team

**Team ByteFury**

---

## 📄 License

Private repository. All rights reserved.
