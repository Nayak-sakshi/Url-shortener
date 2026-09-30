# URL Shortener — Backend

REST API for a URL shortener, built to practise system-design concepts: caching, rate limiting, buffered writes and (in progress) event streaming with Kafka.

**Stack:** Node.js 22, Express 5, MongoDB (Mongoose), Redis, JWT, Joi, Jest + Supertest.

## Features

- Shorten a URL with a generated 8-character code or a custom alias
- Optional expiry date per link
- Register, log in, and manage your own links (list, edit, soft delete)
- Redirects served from a Redis cache, with MongoDB as the fallback
- Click tracking buffered in Redis and written to MongoDB in batches
- Per-link analytics (all time, today, last 7 days) and a dashboard summary
- Rate limiting per route with pluggable strategies (fixed window, sliding window, token bucket)

## Run locally

You need Node.js 22, a MongoDB database and a Redis server.

```bash
npm install
# create .env (see below)
npm run dev      # nodemon, restarts on change
npm start        # plain node
npm test         # Jest, no database needed (everything is mocked)
```

### Environment variables (`.env`)

| Variable | Example | Purpose |
|---|---|---|
| `NODE_ENV` | `development` | Shows error stack traces in responses when `development` |
| `PORT` | `5000` | Port the API listens on (default `3000`) |
| `MONGODB_URI` | `mongodb://localhost:27017/url_shortener` | MongoDB connection string |
| `REDIS_URL` | `redis://127.0.0.1:6379` | Redis connection string |
| `BASE_URL` | `http://localhost:5000` | Used to build `shortUrl` in the create response |
| `JWT_SECRET` | a long random string | Signs login tokens |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime |
| `CLICK_SYNC_INTERVAL_MS` | `60000` | How often buffered clicks are written to MongoDB (default 1 minute) |

Never commit `.env`; it is listed in `.gitignore`.

### Docker

```bash
docker compose up                                # API + Redis (MongoDB comes from MONGODB_URI)
docker compose -f docker-compose.kafka.yml up    # local Kafka broker
docker build -f Dockerfile.prod -t url-shortener .
```

## API

Base path: `/api/v1`. Protected routes need `Authorization: Bearer <token>`.

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Create an account, returns user + token |
| POST | `/auth/login` | — | Log in, returns user + token |
| GET | `/auth/profile` | required | Current user |
| POST | `/urls` | optional | Create a short link (`originalUrl`, optional `customAlias`, `expiresAt`) |
| GET | `/urls/my?page=&limit=` | required | Your links, paginated |
| GET | `/urls/:shortCode` | — | Redirect to the original URL and count the click |
| GET | `/urls/:id` | required | One link's details |
| PATCH | `/urls/:id` | required | Update `originalUrl` and/or `expiresAt` |
| DELETE | `/urls/:id` | required | Soft delete (the link stops working) |
| GET | `/dashboard` | required | Totals: links, active, expired, deleted, clicks |
| GET | `/analytics/:urlId` | required | Clicks for one link: total, today, last 7 days |

Responses share one shape:

```json
{ "success": true, "statusCode": 200, "message": "…", "data": { } }
```

Errors return `success: false` with a `message` (400 validation, 401 auth, 404 not found, 409 alias taken, 410 expired or disabled, 429 rate limited).

### Rate limits (per IP)

| Action | Strategy | Limit |
|---|---|---|
| Log in | Sliding window | 5 per minute |
| Register | Fixed window | 3 per minute |
| Create link | Fixed window | 20 per minute |
| Redirect | Fixed window | 300 per minute |

Configured in `src/config/rateLimit.config.js`.

## How it works

**Redirect (cache-aside).** The API looks up `url:<shortCode>` in Redis. On a miss it reads MongoDB and caches the result for one hour. Updating or deleting a link removes its cache entry.

**Click tracking (write buffering).** Each redirect only increments a Redis counter, `click:<shortCode>`. A worker (`src/workers/clickSync.worker.js`) runs at startup and then every `CLICK_SYNC_INTERVAL_MS`. It reads and clears each counter atomically, bulk-inserts the click records, and updates the link's total. If the database write fails, the count is put back for the next run. Click counts therefore appear with a short delay.

**Rate limiting.** One middleware, several strategies that share a `consume(key, options)` interface. The sliding window runs as a Lua script so the check and the write are atomic.

**Kafka.** Started, not wired in yet: `src/kafka/` has the client and producer; the consumer and topics are empty.

## Project structure

```
src/
  server.js        connect to MongoDB and Redis, start the API and the click worker
  app.js           Express app, middleware and routes
  routes/          paths + middleware + controller
  middlewares/     auth, rate limit, validation, error handler
  controllers/     read the request, call a service, send the response
  services/        business rules
  repositories/    all MongoDB and Redis queries
  models/          Mongoose schemas (User, Url, Click)
  validators/      Joi schemas
  strategies/      rate-limit algorithms
  helpers/ utils/  shared functions (auth, cache, responses, errors)
  workers/         background jobs
  kafka/           Kafka client and producer
  scripts/         Lua scripts for Redis
  tests/           unit and integration tests
```

Request flow: `routes → middlewares → controllers → services → repositories`.
Coding rules for this project are in [`CLAUDE.md`](./CLAUDE.md).

## CI

`.github/workflows/ci.yml` (at the repository root) builds the production Docker image and pushes it to Docker Hub on every push to the `sakshi` branch. It needs the `DOCKER_USERNAME` and `DOCKER_PASSWORD` repository secrets.
