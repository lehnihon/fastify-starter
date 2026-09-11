# fastify-starter

Fastify 5 + TypeScript + Drizzle ORM + Swagger/OpenAPI starter.

## Stack

- **Web framework:** Fastify 5
- **Language:** TypeScript (ESM, strict)
- **ORM:** Drizzle ORM + Drizzle Kit + drizzle-zod
- **Database:** PostgreSQL (postgres.js driver)
- **Validation:** Zod 4 + fastify-type-provider-zod
- **Docs:** @fastify/swagger + Scalar API Reference (at `/reference`)
- **Auth:** @fastify/jwt (JWT via `Authorization: Bearer` header) + argon2 password hashing
- **Observability:** fastify-metrics (Prometheus `/metrics`) + @fastify/under-pressure
- **Plugins:** @fastify/autoload, @fastify/cors, @fastify/helmet, @fastify/sensible,
  @fastify/rate-limit, @fastify/compress, @fastify/request-context
- **Tooling:** Biome (lint + format), Husky + lint-staged (pre-commit)
- **Tests:** Vitest (isolated test database)

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# edit .env (set a real JWT_SECRET)

# 3. Start PostgreSQL
npm run db:up

# 4. Create + apply migrations
npm run db:generate   # creates SQL migration from src/db/schema.ts
npm run db:migrate    # applies migrations

# 5. Seed sample users (optional)
npm run db:seed
```

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start dev server with hot reload (`tsx watch`) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled server |
| `npm test` | Run tests once (`vitest run`) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run typecheck` | Type-check without emitting |
| `npm run lint` | Lint + check with Biome |
| `npm run format` | Format + fix with Biome |
| `npm run db:up` / `db:down` / `db:logs` | Manage the dev database container |
| `npm run db:generate` / `db:migrate` / `db:push` | Drizzle schema/migration workflows |
| `npm run db:seed` | Insert sample users |
| `npm run db:studio` | Open Drizzle Studio (DB browser) |

## Project structure

```
src/
├── server.ts              # entrypoint: buildApp() + listen
├── app.ts                 # buildApp(): builds and wires the Fastify instance
├── env.ts                 # validated environment (zod)
├── db/
│   ├── index.ts           # postgres client + drizzle instance
│   ├── schema.ts          # tables (users)
│   ├── migrate.ts         # programmatic migration runner
│   └── seed.ts            # sample data
├── plugins/               # reusable plugins (all wrapped with fastify-plugin)
│   ├── swagger.ts         # OpenAPI + Scalar UI
│   ├── cors.ts
│   ├── helmet.ts
│   ├── sensible.ts
│   ├── auth.ts            # @fastify/jwt + authenticate decorator
│   ├── request-context.ts # per-request context (authenticated user)
│   ├── error-handler.ts   # centralized error/not-found handlers
│   ├── rate-limit.ts
│   ├── compress.ts
│   ├── under-pressure.ts
│   ├── metrics.ts         # Prometheus /metrics
│   └── db.ts              # closes the Postgres client on shutdown
└── routes/
    ├── health.ts          # GET /health, GET /health/ready
    ├── auth/              # POST /auth/login, GET /auth/me (protected)
    │   ├── index.ts
    │   ├── service.ts     # credential verification
    │   └── schemas.ts
    └── users/             # CRUD /users
        ├── index.ts
        ├── service.ts     # password hashing
        ├── schemas.ts     # drizzle-zod derived validation schemas
        └── repository.ts  # drizzle queries
```

## Route patterns to follow

### Basic route (health)

```ts
fastify.withTypeProvider<ZodTypeProvider>().get('/health', {
  schema: {
    tags: ['health'],
    response: { 200: z.object({ status: z.literal('ok') }) },
  },
}, async () => ({ status: 'ok' as const }))
```

### Database route (users)

Schemas are derived from the table with `drizzle-zod` (no duplication):

```ts
// schemas.ts
export const userSelectSchema = createSelectSchema(users)
export const userInsertSchema = createInsertSchema(users, { email: z.string().email() })
  .omit({ id: true, createdAt: true, updatedAt: true })
```

Queries live in a `repository.ts`, business logic (hashing, not-found checks)
in a `service.ts`, and handlers call the service:

```ts
// index.ts
app.post('/', { schema: { body: userInsertSchema, response: { 201: successSchema(userSelectSchema) } } },
  async (request, reply) => {
    const user = await usersService.create(request.body)
    return reply.code(201).send({ data: user })
  })
```

### Protected route (auth)

```ts
app.get('/me', { preHandler: app.authenticate, schema: { response: { 200: meResponseSchema } } },
  async (request) => {
    return { data: { sub: request.user.sub, email: request.user.email } }
  })
```

The `authenticate` decorator verifies the JWT from the `Authorization: Bearer`
header and stores the authenticated user in the request context (see
`src/plugins/auth.ts`). Access it anywhere via
`fastify.requestContext.get('user')`.

## Conventions

### Layering

`route → service → repository → db`. Routes parse/validate and delegate;
services hold business logic and throw domain errors; repositories run the
Drizzle queries. Files are colocated per domain under `src/routes/<domain>/`.

### Errors

Throw domain errors from services (see `src/lib/errors.ts`) instead of
returning `null`/`undefined` or calling `reply.notFound(...)`:

```ts
if (!user) throw new NotFoundError('User')
```

The centralized handler (`src/plugins/error-handler.ts`) turns them into a
consistent shape:

```json
{ "error": { "code": "NOT_FOUND", "statusCode": 404, "message": "User not found" } }
```

Available codes: `NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`, `BAD_REQUEST`,
`CONFLICT`, `VALIDATION_ERROR`, `INTERNAL_ERROR`.

### Response envelope

Success responses are wrapped in `{ data, meta? }`; errors in `{ error }`.

```json
// single resource
{ "data": { "id": "...", "name": "Ada" } }

// paginated list
{
  "data": [ ... ],
  "meta": { "pagination": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 } }
}
```

Use the schema helpers in `src/lib/http.ts` (`successSchema`, `paginatedSchema`).

### Request ID

Every request gets an `X-Request-Id` header (incoming value reused when
provided, otherwise a UUID). It is echoed in the response and stored in the
request context, so it correlates logs end-to-end.

### Versioning

Pass a prefix to version the API routes:

```ts
buildApp({ prefix: '/v1' })
```

`/metrics` and `/reference` stay at the root; route folders keep their
`dirNameRoutePrefix` behavior under the prefix.

## API docs

- Scalar UI: http://localhost:3000/reference

OpenAPI spec is generated automatically from your Zod route schemas via
`fastify-type-provider-zod` + `@fastify/swagger`.

## Metrics

Prometheus metrics are exposed at `GET /metrics` via `fastify-metrics`
(default server metrics + route timings).

To scrape them with Prometheus (and visualize in Grafana), point a scrape
config at the app:

```yaml
# prometheus.yml
scrape_configs:
  - job_name: fastify
    metrics_path: /metrics
    static_configs:
      - targets: ['localhost:3000']
```

The stack (Prometheus + Grafana) is intentionally left out of this starter —
add it to your own compose/manifests when you need self-hosted monitoring.

## Tests

Tests use Vitest and inject requests against `buildApp()` without opening a port.
They run against an **isolated test database** (`db_test` service, port 5433) so
they never touch your dev data:

```bash
docker compose up -d          # starts dev + test databases
npm test
```
