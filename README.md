# Care Continuum

A maternal and child health tracker for community health workers (CHWs).

This repo is a monorepo with two apps:

- **[server/](server/)** — Express + MongoDB API (auth, mothers, children, ANC/vaccination scheduling, growth risk flagging, reminders). See [server/README.md](server/README.md) for setup, running, and testing.
- **[client/](client/)** — React + Vite frontend. See [client/README.md](client/README.md) for setup and running.

## Quick start

```bash
# API
cd server
npm install
cp .env.example .env   # fill in MONGO_URI / JWT_SECRET
npm run dev             # http://localhost:3000

# Frontend (separate terminal)
cd client
npm install
cp .env.example .env    # points at the API's base URL
npm run dev              # http://localhost:5173
```

Both apps run independently; the client talks to the API over HTTP using the base URL in its `.env` (`VITE_API_BASE_URL`).
