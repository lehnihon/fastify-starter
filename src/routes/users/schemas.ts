import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod/v4'
import { users } from '../../db/schema.ts'

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
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})
