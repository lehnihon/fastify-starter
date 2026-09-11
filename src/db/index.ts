import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '#app/db/schema'
import { env } from '#app/env'

export const client = postgres(env.DATABASE_URL)
export const db = drizzle(client, { schema })

export type Db = typeof db
