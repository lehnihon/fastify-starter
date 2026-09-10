# fastify-starter

Fastify 5 + TypeScript + Drizzle ORM + Swagger/OpenAPI starter.

## Stack

- **Web framework:** Fastify 5
- **Language:** TypeScript (ESM, strict)
- **ORM:** Drizzle ORM + Drizzle Kit + drizzle-zod
- **Database:** PostgreSQL (postgres.js driver)
- **Validation:** Zod 4 + fastify-type-provider-zod
- **Docs:** @fastify/swagger + Scalar API Reference (at `/reference`)
- **Auth:** @fastify/jwt (JWT via `Authorization: Bearer` header)
- **Plugins:** @fastify/cors, @fastify/helmet, @fastify/sensible, @fastify/rate-limit
- **Tests:** Vitest

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
│   ├── auth.ts            # @fastify/jwt
│   └── rate-limit.ts
└── routes/
    ├── health.ts          # GET /health
    ├── auth/              # POST /auth/login, GET /auth/me (protected)
    │   ├── index.ts
    │   └── schemas.ts
    └── users/             # CRUD /users
        ├── index.ts
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
app.get('/me', { schema: { response: { 200: meResponseSchema } } },
  async (request) => {
    await request.jwtVerify()                 // reads the `Authorization: Bearer` header
    return { sub: request.user.sub, email: request.user.email }
  })
```

The `@fastify/jwt` plugin is configured to read/sign the JWT from the
`Authorization: Bearer` header (see `src/plugins/auth.ts`).

## API docs

- Scalar UI: http://localhost:3000/reference

OpenAPI spec is generated automatically from your Zod route schemas via
`fastify-type-provider-zod` + `@fastify/swagger`.

## Tests

Tests use Vitest and inject requests against `buildApp()` without opening a port.
The `globalSetup` applies migrations against `DATABASE_URL`, so a running Postgres is required:

```bash
npm run db:up
npm test
```
