# URL Shortener

A full-stack URL shortener, built to practise system-design concepts: caching, rate limiting, buffered writes and (in progress) event streaming with Kafka.

Shorten a link, share it, and see how often it is clicked.

## What's inside

| Folder | What it is | Stack | Docs |
|---|---|---|---|
| [`backend/`](./backend) | REST API | Node.js, Express 5, MongoDB, Redis, JWT | [backend/README.md](./backend/README.md) |
| [`frontend/`](./frontend) | Web app | React 19, React Router 7, Vite | [frontend/README.md](./frontend/README.md) |

## Features

- Shorten a URL with a generated code or a custom ending, with an optional expiry date
- Accounts: register, log in, and manage your own links
- Fast redirects served from a Redis cache, with MongoDB as the fallback
- Click tracking buffered in Redis and written to MongoDB in batches
- Dashboard totals and per-link analytics with a 7-day chart
- Rate limiting per route (fixed window and sliding window)

## Quick start

You need Node.js 22, a MongoDB database and a Redis server.

```bash
# 1. API (http://localhost:5000)
cd backend
npm install
# create backend/.env — see backend/README.md for the variables
npm run dev

# 2. Web app (http://localhost:5173), in a second terminal
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The web app forwards `/api` requests to the API on port 5000.

## How a click flows through the system

```
browser ──> frontend /<code> ──> API /api/v1/urls/<code>
                                   │
                                   ├─ Redis cache hit?  ── yes ──> redirect
                                   │        no
                                   ├─ MongoDB lookup, then cache for 1 hour ──> redirect
                                   │
                                   └─ increment click:<code> in Redis
                                            │
                        click sync worker (every minute)
                                            │
                              MongoDB: click records + link total
```

## Tests and CI

```bash
cd backend && npm test
```

The workflow in `.github/workflows/ci.yml` builds the backend's production Docker image and pushes it to Docker Hub on every push to the `sakshi` branch.
