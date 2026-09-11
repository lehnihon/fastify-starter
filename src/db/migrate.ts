import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { client, db } from '#app/db/index'

await migrate(db, { migrationsFolder: './drizzle' })
await client.end()
