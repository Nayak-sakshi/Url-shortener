# URL Shortener — Frontend

Web app for the URL shortener API in [`../backend`](../backend). Shorten links, manage them, and see how often they are clicked.

**Stack:** React 19, React Router 7, Vite 8, plain CSS. No UI or chart library.

## Features

- Shorten a link with or without an account
- Optional custom ending and expiry date
- Create an account and log in (token kept in `localStorage`)
- Dashboard with totals and a paginated list of your links
- Per-link page: clicks all time, today, and a 7-day chart; edit and delete
- Short links open on this site (`/<code>`) and are forwarded to the API redirect
- Works on phone-width screens

## Run locally

Start the backend first (see [`../backend/README.md`](../backend/README.md)), then:

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build into dist/
npm run preview    # serve the production build
```

In dev, Vite forwards `/api/*` to the backend, so no CORS setup is needed.

### Environment variables (`.env`, optional)

Copy `.env.example` to `.env` to change the defaults.

| Variable | Default | Purpose |
|---|---|---|
| `VITE_PROXY_TARGET` | `http://localhost:5000` | Where the dev server forwards `/api` requests |
| `VITE_API_URL` | `/api/v1` | API base used by the browser. In production set the full URL, e.g. `https://api.example.com/api/v1` |

## Pages

| Path | What it does |
|---|---|
| `/` | Shorten a link |
| `/login`, `/register` | Log in, create an account |
| `/dashboard` | Your links, totals, pagination (login required) |
| `/dashboard/links/:id` | Clicks for one link, edit, delete (login required) |
| `/:shortCode` | Forwards to the API redirect, which counts the click |

Page paths are aliases the backend reserves (`login`, `register`, `dashboard`), so a short code can never collide with a page.

## Project structure

```
src/
  main.jsx       entry: router + auth provider
  App.jsx        route table
  api/           client.js (fetch wrapper, errors, token) + one file per backend resource
  context/       AuthContext: session, login, register, logout
  hooks/         useAsync (load data), useSubmit (form actions)
  components/    reusable UI: forms, table, chart, buttons, status messages
  pages/         one component per route
  utils/         formatting, URL helpers, token storage
  styles/        app.css (colour and size tokens at the top)
```

### Conventions

- Components never call `fetch` directly; they use functions from `api/`.
- Pages load data with `useAsync` and run form actions with `useSubmit`, so loading and error states are handled the same way everywhere.
- Shared logic goes in `utils/` or `hooks/`; shared UI goes in `components/`.
- Form rules mirror the backend validators, so most mistakes are caught before a request is sent.
- Colours, radii and the font are CSS variables at the top of `styles/app.css`. Green is for actions and links, gold is for clicks, red is for expired and delete.

## Notes

- Click counts can take about a minute to appear, because the backend writes them in batches.
- A rejected or expired token logs you out and sends you to the login page.
- When deploying as a static site, configure the host to serve `index.html` for unknown paths, so `/dashboard` and `/<code>` work on refresh.
