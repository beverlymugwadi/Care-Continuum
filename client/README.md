# Care Continuum — Client

React + Vite frontend for Care Continuum. Talks to the [API in ../server](../server) over HTTP.

## Setup

```bash
npm install
cp .env.example .env
```

`VITE_API_BASE_URL` in `.env` should point at the running API (defaults to `http://localhost:3000/api`, matching the server's default port).

## Run

```bash
npm run dev       # dev server with HMR, http://localhost:5173
npm run build     # production build to dist/
npm run preview   # serve the production build locally
```

## Structure

```
src/
  components/   reusable UI pieces (Navbar, ProtectedRoute, ...)
  pages/        route-level views (LoginPage, RegisterPage, DashboardPage, ...)
  services/     axios-based API clients, one module per backend resource
  context/      React context providers (AuthContext holds the JWT + current user)
  utils/        small stateless helpers (date formatting, etc.)
  App.jsx       route definitions
  main.jsx      entry point: BrowserRouter + AuthProvider + App
```

Auth works the same way as the API: `AuthContext` stores the JWT returned by
`/api/auth/login` or `/api/auth/register` in `localStorage`, and
`services/api.js` attaches it to every request via an axios interceptor.
`ProtectedRoute` redirects to `/login` when there's no token.
