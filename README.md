# Care Continuum

Express-based API server.

## Setup

```bash
npm install
cp .env.example .env
```

## Run

```bash
npm start      # production
npm run dev    # development, with nodemon auto-reload
```

Server starts on the port set in `.env` (`PORT`, defaults to 3000).

## Structure

```
src/
  routes/       route definitions
  controllers/  request handlers
  models/       data models
  middleware/   express middleware (error handling, auth, etc.)
  config/       app configuration
server.js       app entry point
```

## Endpoints

- `GET /` — liveness check
- `GET /api/health` — health check
