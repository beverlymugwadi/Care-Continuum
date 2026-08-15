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

## Test

```bash
npm test
```

Runs the Jest + Supertest suite against a separate `care-continuum-test`
database (config in `.env.test`, already checked in -- it holds no real
secrets). Requires a local MongoDB reachable at the same host as `.env`;
each test file connects, and collections are wiped after every test so runs
don't interfere with each other or with dev data.

## Structure

```
src/
  app.js        configured Express app (no listen/DB connect -- used by tests)
  routes/       route definitions
  controllers/  request handlers
  models/       data models
  middleware/   express middleware (error handling, auth, etc.)
  config/       app configuration
server.js       connects to MongoDB and starts src/app.js listening
tests/          Jest + Supertest suite
```

## Endpoints

- `GET /` — liveness check
- `GET /api/health` — health check
