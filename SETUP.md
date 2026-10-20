# SyncSpace — Setup & Deployment Guide

This guide takes you from zero to a running SyncSpace locally (about 15 minutes), then to a production deployment. Only **PostgreSQL** is required; every other service is optional and the app degrades gracefully without it.

- [1. Prerequisites](#1-prerequisites)
- [2. Backend](#2-backend)
- [3. Frontend](#3-frontend)
- [4. First run](#4-first-run)
- [5. Optional services](#5-optional-services)
- [6. Deploy to production (Render)](#6-deploy-to-production-render)
- [7. Diagnostic tools](#7-diagnostic-tools)
- [8. Troubleshooting](#8-troubleshooting)
- [9. Production security checklist](#9-production-security-checklist)

---

## 1. Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Go | 1.25+ | backend |
| Node.js | 18.18+ (20 LTS recommended) | frontend |
| PostgreSQL | 14+ | local, or a free hosted database ([Neon](https://neon.tech), Supabase) |
| `psql` | any | to load the schema — or paste `schema.sql` into your provider's SQL editor |

Two repositories: **`SyncSpace-Backend`** (Go API) and **`SyncSpace`** (Next.js app in `frontend/`). Clone them side by side.

---

## 2. Backend

### 2.1 Database

Create an empty database, then load the schema:

```bash
cd SyncSpace-Backend
psql "postgresql://user:password@host/dbname?sslmode=require" -f schema.sql
```

No `psql`? Open your provider's SQL editor (e.g. Neon → SQL Editor), paste the contents of `schema.sql`, and run it.

Local Postgres with Docker, if you prefer:

```bash
docker run -d --name syncspace-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=syncspace -p 5432:5432 postgres:16
psql "postgresql://postgres:postgres@localhost:5432/syncspace" -f schema.sql
```

> **Upgrading an existing database?** Run the files in `migrations/` in order — they are safe to run more than once.

### 2.2 Environment

```bash
cp .env.example .env
```

**Required:**

| Variable | Example | Purpose |
|---|---|---|
| `DB_URL` | `postgresql://…?sslmode=require` | PostgreSQL connection string (`sslmode=disable` for local Docker) |
| `JWT_SECRET` | 32+ random bytes | Signs login tokens. Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `FRONTEND_URL` | `http://localhost:3000` | CORS origin and invite-link base. **Exact origin, no trailing slash.** |
| `PORT` | `8080` | API port |

Optional groups (Redis, Groq, Brevo, Cloudinary, Ollama) are described in [section 5](#5-optional-services) and in comments inside `.env.example`.

### 2.3 Run

```bash
go run ./cmd
```

Check it's up:

```bash
curl http://localhost:8080/health      # → 200
```

The startup log reports which optional services are enabled (e.g. `REDIS_URL not set — WebSocket hub disabled`).

Production build: `go build -o syncspace ./cmd` (or use the included `Dockerfile`).

---

## 3. Frontend

```bash
cd SyncSpace/frontend
cp .env.example .env.local
npm install
npm run dev            # http://localhost:3000
```

| Variable | Example | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_BASE` | `http://localhost:8080` | Backend URL (**required in production**) |
| `NEXT_PUBLIC_WS_BASE` | `ws://localhost:8080` | Backend WebSocket URL — `wss://` in production |
| `NEXTAUTH_URL` | `http://localhost:3000` | This app's own public URL |
| `NEXTAUTH_SECRET` | random string | Signs NextAuth sessions (generate like `JWT_SECRET`) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | | Optional — omit to hide Google sign-in |
| `GITHUB_ID` / `GITHUB_SECRET` | | Optional — omit to hide GitHub sign-in |

> `NEXT_PUBLIC_*` values are **baked in at build time**. After changing them in production, rebuild/redeploy the frontend.

---

## 4. First run

1. Open http://localhost:3000 → **Sign up** with email and password.
2. The onboarding wizard creates your **organization**, offers to invite teammates (skippable) and creates your **first board**.
3. You're the organization **Owner**. Invite others from *Organization → Members* and assign roles:

| Role | Can |
|---|---|
| Owner | everything, including organization settings |
| Admin | manage members, edit boards, tasks and flows |
| Member | create/edit/move/delete tasks and flows |
| Viewer | read-only |

---

## 5. Optional services

### Redis — real-time collaboration
Live cursors, presence, vote sync and presenter mode run over WebSockets coordinated through Redis pub/sub (so several API instances stay in sync).
Set `REDIS_URL` (e.g. a free [Upstash](https://upstash.com) database: `rediss://default:<password>@<host>:6379`). Without it, everything except the live features works.

### Groq — AI features
Sign up at [console.groq.com](https://console.groq.com), create an API key, set `GROQ_API_KEY`.

| Variable | Default | Notes |
|---|---|---|
| `GROQ_MODEL` | `openai/gpt-oss-20b` | Board chat and summarize |
| `GROQ_DIAGRAM_MODEL` | `openai/gpt-oss-120b` | First model tried for diagrams |
| `GROQ_DIAGRAM_FALLBACKS` | `$GROQ_MODEL,qwen/qwen3.8-27b` | Tried in order when the previous model is busy or fails |
| `GROQ_DIAGRAM_WEB_SEARCH` | `true` | Server-side switch for the panel's "Search the web" option |

Each Groq model has its own per-minute token limit, so the fallback chain gives you headroom on the free tier. The backend logs a warning at startup if a configured model isn't available to your key. Groq's model catalogue changes — run `go run ./cmd/aitest` to check yours.

Without `GROQ_API_KEY`, chat and summarize use a local [Ollama](https://ollama.com) server (`OLLAMA_URL`, `OLLAMA_MODEL`) and diagram generation is disabled.

### Brevo — invitation emails
1. Create a [Brevo](https://www.brevo.com) account and an API key → `BREVO_API_KEY`.
2. Verify a sender address in Brevo → `BREVO_FROM_EMAIL`.
3. In Brevo → *Security → Authorised IPs*, **disable IP blocking** (cloud hosts use changing IPs; otherwise every send fails with 401).

Without Brevo, invites are still created — share the invite link manually. Test with `go run ./cmd/mailtest -to you@example.com` (dry run) and add `-send` to send for real.

### Cloudinary — avatar uploads
Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. Without them, avatar upload is disabled.

### Google / GitHub sign-in
**Google** — [Google Cloud Console](https://console.cloud.google.com) → *APIs & Services → Credentials → OAuth client ID* (Web application):
- Authorised redirect URI: `<NEXTAUTH_URL>/api/auth/callback/google`
- *OAuth consent screen*: while in **Testing** mode only listed *test users* can sign in — add them, or publish the app.

**GitHub** — *Settings → Developer settings → OAuth Apps → New*:
- Authorization callback URL: `<NEXTAUTH_URL>/api/auth/callback/github`

Put the IDs and secrets in the frontend env.

---

## 6. Deploy to production (Render)

The free tier works for demos (services sleep after ~15 minutes idle; the first request then takes ~50 s).

1. **Database**: create a hosted Postgres (Neon free tier works) and load `schema.sql`.
2. **Backend** — *New → Blueprint* pointing at `SyncSpace-Backend` (uses `render.yaml`, Docker), or *New → Web Service → Docker*. Set the environment from section 2.2 and 5. Leave `FRONTEND_URL` for step 4.
3. **Frontend** — *New → Web Service* (not Static Site — NextAuth needs a server):
   - Root directory: `frontend`
   - Build command: `npm install && npm run build`
   - Start command: `npm run start`
   - Env: `NEXT_PUBLIC_API_BASE=https://<backend>.onrender.com`, `NEXT_PUBLIC_WS_BASE=wss://<backend>.onrender.com`, `NEXTAUTH_URL=https://<frontend>.onrender.com`, `NEXTAUTH_SECRET`, OAuth keys.
4. Once the frontend URL is known (Render may append a suffix such as `-abcd`), set the backend's **`FRONTEND_URL`** to it exactly and the frontend's **`NEXTAUTH_URL`** to the same, then redeploy both.
5. Add the production callback URLs to Google/GitHub (section 5).
6. Visit the frontend, sign up, and run through section 4.

The same steps apply to any host that runs a Docker container (backend) and a Node server (frontend): Railway, Fly.io, a VPS, etc.

---

## 7. Diagnostic tools

Run from `SyncSpace-Backend` (they read `.env` like the server):

| Command | What it checks |
|---|---|
| `go run ./cmd/aitest` | Which Groq models your key can use, then a real diagram generation |
| `go run ./cmd/aitest -n 8 -search` | Stress test: 8 varied prompts back to back with web search |
| `go run ./cmd/mailtest -to you@x.com` | Brevo key, sender verification, invite template, rendering (dry run) |
| `go test ./...` | Unit tests |

---

## 8. Troubleshooting

| Symptom | Cause / fix |
|---|---|
| Browser console shows **CORS** errors | Backend `FRONTEND_URL` must exactly match the frontend origin (scheme, host, no trailing slash). Redeploy the backend after changing it. |
| Every request goes to `localhost` in production | `NEXT_PUBLIC_API_BASE` / `NEXT_PUBLIC_WS_BASE` missing at **build** time — set them and redeploy the frontend. |
| Live cursors / presence don't work | `REDIS_URL` not set, or `NEXT_PUBLIC_WS_BASE` uses `ws://` on an HTTPS site (use `wss://`). |
| Invite emails never arrive | Run `go run ./cmd/mailtest`. Common causes: Brevo IP blocking enabled (401 "unrecognised IP"), unverified sender, or the email is in Spam. |
| Google sign-in: "Access blocked / app not verified" | OAuth consent screen is in Testing mode — add the user as a test user or publish the app. Check the redirect URI matches exactly. |
| "AI is busy" / diagrams slow | Groq free-tier rate limits. The panel retries automatically; add models to `GROQ_DIAGRAM_FALLBACKS` or upgrade the Groq plan. Check `go run ./cmd/aitest`. |
| AI features return an error at startup log `model … not available` | That model isn't on your Groq key — change `GROQ_DIAGRAM_MODEL` / `GROQ_MODEL` to one listed by `aitest`. |
| Voting or notification settings return 500 | Database created from an older schema — run the files in `migrations/`. |
| A board page renders empty after deploying from Windows/macOS | Linux filesystems are case-sensitive: route folder names (e.g. `[boardid]`) must match the casing used in code and in git. |
| First request takes ~50 s | Free-tier hosts sleep when idle — expected. Use a paid instance or an uptime ping to keep it warm. |

---

## 9. Production security checklist

- [ ] Strong, unique `JWT_SECRET` and `NEXTAUTH_SECRET` (never reuse the examples). Rotating `JWT_SECRET` signs everyone out.
- [ ] `.env` files are never committed (already in `.gitignore`), nor database dumps (`dump*.sql` is ignored).
- [ ] `GIN_MODE=release` in production.
- [ ] `FRONTEND_URL` set to your real domain only (it is the sole CORS origin).
- [ ] Google OAuth app published (or test users listed) before inviting real users.
- [ ] Database backups enabled at your provider.
