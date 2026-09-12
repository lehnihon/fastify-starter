import { count, eq } from 'drizzle-orm'
import { db } from '#app/db/index'
import type { NewUser } from '#app/db/schema'
import { users } from '#app/db/schema'

export const usersRepository = {
  async list(limit: number, offset: number) {
    return db.select().from(users).limit(limit).offset(offset)
  },

  async count() {
    const [result] = await db.select({ count: count() }).from(users)
    return result?.count ?? 0
  },

  async findById(id: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1)
    return user
  },

  async findByEmail(email: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)
    return user
  },

  async create(data: NewUser) {
    const [user] = await db.insert(users).values(data).returning()
    if (!user) throw new Error('Failed to create user')
    return user
  },

  async update(id: string, data: Partial<NewUser>) {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning()
    return user
  },

  async remove(id: string) {
    const [user] = await db.delete(users).where(eq(users.id, id)).returning()
    return user
  },
}
