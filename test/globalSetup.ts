import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

export default async function setup() {
  try {
    process.loadEnvFile('.env.test')
  } catch {
    // no .env.test file — rely on the real environment
  }

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL is required to run tests (docker compose up -d)',
    )
  }

  const client = postgres(databaseUrl, { max: 1 })
  const db = drizzle(client)

  await migrate(db, { migrationsFolder: './drizzle' })

  await client.end()
}
