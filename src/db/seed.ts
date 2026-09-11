import { eq } from 'drizzle-orm'
import { client, db } from '#app/db/index'
import { users } from '#app/db/schema'
import { hashPassword } from '#app/lib/password'

const seedUsers = [
  { name: 'Ada Lovelace', email: 'ada@example.com', password: 'supersecret' },
  { name: 'Grace Hopper', email: 'grace@example.com', password: 'supersecret' },
  {
    name: 'Linus Torvalds',
    email: 'linus@example.com',
    password: 'supersecret',
  },
]

async function seed() {
  for (const { password, ...user } of seedUsers) {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, user.email))
      .limit(1)

    if (existing.length === 0) {
      await db
        .insert(users)
        .values({ ...user, password: await hashPassword(password) })
    }
  }

  console.log(`Seeded ${seedUsers.length} users`)
}

await seed()
await client.end()
