# URL Shortener — Backend

Node.js (CommonJS) + Express 5, MongoDB (Mongoose), Redis, JWT auth, Joi validation, Jest + Supertest. Kafka (kafkajs) is being introduced for async analytics. Goal of the project: learn and apply system-design concepts, so every change should be written as if it must scale.

## Commands

- `npm run dev` — start with nodemon
- `npm start` — start server
- `npm test` — run Jest (unit + integration, all external deps mocked)
- `docker compose up` — app + Redis (MongoDB comes from `MONGODB_URI` in `.env`)
- `docker compose -f docker-compose.kafka.yml up` — local Kafka broker

## Architecture (follow strictly)

```
routes → middlewares → controllers → services → repositories → models / Redis
```

| Layer | Responsibility | Must NOT |
|---|---|---|
| `routes/` | Wire path + middlewares + controller | Contain logic |
| `middlewares/` | Auth, rate limit, validation, errors | Query DB directly |
| `controllers/` | Read `req`, call one service, send `ApiResponse` | Contain business logic or DB calls |
| `services/` | Business rules, orchestration, throw `AppError` | Touch `req`/`res` or Mongoose models directly |
| `repositories/` | All DB/Redis queries | Contain business rules |
| `helpers/` | Reusable pure-ish functions (auth, cache, url, object) | Depend on Express |
| `validators/` | Joi schemas, used via `middlewares/validate.js` | — |
| `strategies/` | Pluggable rate-limit algorithms with a `consume(key, options)` interface | — |
| `workers/` | Background/batch jobs (click sync, Kafka consumers) | Run inside a request |

New feature = new file in each relevant layer, named `<feature>.<layer>.js` (e.g. `analytics.service.js`).

## Reuse before you write

Always use the existing building blocks instead of re-implementing:

- **Async controllers/middlewares:** wrap with `utils/asyncHandler` — never write try/catch just to call `next(err)`.
- **Responses:** `ApiResponse.success(res, data, message, statusCode)` — never hand-build `res.json({...})`.
- **Errors:** `throw new AppError(message, statusCode)` from `errors/AppError`; the global `errorHandler` formats it. Always import `AppError` in files that use it.
- **Validation:** add a Joi schema in `validators/` and use `validate(schema)` in the route. Don't validate manually in services.
- **Auth:** `authenticate` / `optionalAuthenticate` from `middlewares/auth.middleware`; token logic lives in `helpers/auth.helper`.
- **Rate limiting:** add an entry in `config/rateLimit.config.js` and use `rateLimiter(config.X)`. New algorithms go in `strategies/` with the same `consume` contract.
- **Redis:** go through `repositories/redis.repository` or `helpers/cache.helper` — never import `redisClient` in services.
- **Field whitelisting:** `pick(obj, fields)` from `helpers/object.helper` for any user-supplied update payload.
- **URL access checks:** `validateAccessibleUrl` and `RESERVED_ALIASES` from `helpers/url.helper`.

If the same logic appears twice, extract it into a helper/repository method. Shared constants (projections, TTLs, key prefixes) belong in one module — never reference an undefined constant.

## Scalability rules

### Read path (redirect is the hot path)
- Redirect must stay **cache-first** (`url:<shortCode>` in Redis) with a TTL; DB is the fallback.
- **Invalidate the cache** (`url:<shortCode>`) whenever a URL is updated, deleted, or expires.
- Keep the redirect path minimal: no extra DB writes, no blocking work. Push side effects (click tracking, analytics) to Redis counters or Kafka.

### Write path / background work
- Buffer high-frequency writes (clicks) in Redis and flush in batches from `workers/`.
- Use atomic Redis operations (`GETDEL`, `INCR`, Lua scripts) — never read-then-delete in two calls.
- Use `SCAN`, never `KEYS`, in production code.
- Use bulk DB operations (`insertMany`, `bulkWrite`) instead of loops of single inserts/updates.
- Every click must be counted exactly once — don't record the same event in two places.

### Database
- Every field used in a query filter or sort must be indexed (compound indexes for combined filters, e.g. `{ userId, isActive, createdAt }`).
- Use `.lean()` and `.select()` projections for read-only queries.
- Run independent queries in parallel with `Promise.all`.
- In aggregations, cast IDs explicitly (`new mongoose.Types.ObjectId(id)`) — aggregate does not auto-cast.
- Prefer aggregation/`countDocuments` in the DB over loading documents into memory.
- Always paginate list endpoints (clamp `limit`, max 100).
- Soft delete with `isActive`/`deletedAt`; filter them out consistently in every query.

### Rate limiting
- Rate-limit keys must be namespaced per route/action: `rate_limit:<action>:<ip|userId>` — never share one key across limits.
- Prefer atomic Lua scripts for multi-step limit logic.

### Stateless & horizontally scalable
- No in-memory state for data that must be shared across instances (use Redis/Mongo/Kafka).
- All config via `process.env` (loaded by `dotenv` in `server.js`); no hardcoded hosts, ports, brokers, or secrets.
- Background intervals must be safe when multiple instances run (use locks or move to a Kafka consumer).

## Clean code conventions

- CommonJS (`require` / `module.exports`). Services/repositories/controllers are classes exported as singletons (`module.exports = new XService()`).
- Small, single-purpose functions; early returns over nested `if`s.
- Descriptive names; fix typos when touching code (`increamentClickBy`, `findByOrignalUrl`).
- No dead code, unreachable returns, unused variables/imports, or commented-out blocks.
- No `console.log` debugging left in hot paths; keep logs meaningful.
- Never trust client input: validate with Joi, whitelist update fields, never expose `password` or internal fields.
- Consistent 4-space indentation and double quotes to match existing code.

## Testing

- Tests live in `src/tests/unit` and `src/tests/integration`.
- Mock repositories, Redis, and rate limiter (see existing tests for the pattern).
- Every new service method needs unit tests; every new route needs integration tests covering success, validation (400), auth (401), not found (404), and conflict (409) where relevant.
- Run `npm test` before considering a change done.
