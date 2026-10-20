# SyncSpace — frontend

Next.js 15 / React 19 app for SyncSpace. See the [project README](../README.md) for features and architecture, and **[SETUP.md](../SETUP.md)** for full setup and deployment.

```bash
cp .env.example .env.local   # set NEXT_PUBLIC_API_BASE / NEXT_PUBLIC_WS_BASE and NEXTAUTH_SECRET
npm install
npm run dev                  # http://localhost:3000
```

| Command | What it does |
|---|---|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

Requires Node.js 18.18+ (20 LTS recommended) and a running [SyncSpace backend](../SETUP.md#2-backend).
