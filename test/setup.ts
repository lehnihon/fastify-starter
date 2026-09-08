import { buildApp } from '../src/app.ts'
import { db } from '../src/db/index.ts'
import { users } from '../src/db/schema.ts'

export async function resetDb() {
  await db.delete(users)
}

export { buildApp }
