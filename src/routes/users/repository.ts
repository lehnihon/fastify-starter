import { eq } from 'drizzle-orm'
import { db } from '../../db/index.ts'
import type { NewUser } from '../../db/schema.ts'
import { users } from '../../db/schema.ts'

export const usersRepository = {
  async list(limit: number, offset: number) {
    return db.select().from(users).limit(limit).offset(offset)
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
    return user!
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
