# URL Shortener — Frontend

React 19 + React Router 7 + Vite. Talks to the API in `../backend`.

## Run

```bash
npm install
cp .env.example .env   # optional, defaults work with the backend on port 5000
npm run dev            # http://localhost:5173
```

Start the backend first (`npm run dev` in `../backend`, with MongoDB and Redis running).
In dev, Vite forwards `/api/*` to the backend, so there is no CORS setup.

## Pages

| Path | What it does |
|---|---|
| `/` | Shorten a link (works without an account) |
| `/login`, `/register` | Log in, create an account |
| `/dashboard` | Your links, totals, pagination |
| `/dashboard/links/:id` | Clicks for one link, edit, delete |
| `/:shortCode` | Forwards to the API redirect, which counts the click |

Page paths are the aliases the backend reserves, so a short code never collides with a page.

## Structure

```
src/
  api/         fetch wrapper (client.js) + one file per backend resource
  context/     AuthContext: session, login, register, logout
  hooks/       useAsync (load data), useSubmit (form actions)
  components/  reusable UI (forms, table, chart, buttons)
  pages/       one component per route
  utils/       formatting, URL helpers, token storage
  styles/      app.css (design tokens at the top)
```

Rules: pages call `api/` functions only through `useAsync` / `useSubmit`;
components never call `fetch` directly; shared logic goes in `utils/` or `hooks/`.
