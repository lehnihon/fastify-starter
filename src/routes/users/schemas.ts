import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod/v4'
import { users } from '#app/db/schema'

export const userSelectSchema = createSelectSchema(users).omit({
  password: true,
})

export const userInsertSchema = createInsertSchema(users, {
  email: z.email(),
  password: z.string().min(8),
}).omit({ id: true, createdAt: true, updatedAt: true })

export const userUpdateSchema = userInsertSchema.partial()

export const userParamsSchema = z.object({
  id: z.string().uuid(),
})

export const userListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})
