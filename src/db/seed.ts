import { eq } from 'drizzle-orm'
import { client, db } from './index.ts'
import { users } from './schema.ts'

const seedUsers = [
  { name: 'Ada Lovelace', email: 'ada@example.com' },
  { name: 'Grace Hopper', email: 'grace@example.com' },
  { name: 'Linus Torvalds', email: 'linus@example.com' },
]

async function seed() {
  for (const user of seedUsers) {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, user.email))
      .limit(1)

    if (existing.length === 0) {
      await db.insert(users).values(user)
    }
  }

  console.log(`Seeded ${seedUsers.length} users`)
}

await seed()
await client.end()
