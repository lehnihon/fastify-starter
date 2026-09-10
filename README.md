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

Queries live in a `repository.ts`, handlers call the repository:

```ts
app.post('/', { schema: { body: userInsertSchema, response: { 201: userSelectSchema } } },
  async (request, reply) => {
    const user = await usersRepository.create(request.body)
    return reply.code(201).send(user)
  })
```

### Protected route (auth)

```ts
app.get('/me', { preHandler: app.authenticate, schema: { response: { 200: meResponseSchema } } },
  async (request) => {
    return { sub: request.user.sub, email: request.user.email }
  })
```

The `authenticate` decorator verifies the JWT from the `Authorization: Bearer`
header and stores the authenticated user in the request context (see
`src/plugins/auth.ts`). Access it anywhere via
`fastify.requestContext.get('user')`.

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
