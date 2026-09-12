import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod/v4'
import { users } from '#app/db/schema'
import { paginatedSchema, schemaFor, successSchema } from '#app/lib/http'

export const userSelectSchema = createSelectSchema(users, {
  role: z.enum(['user', 'admin']),
}).omit({
  password: true,
})

export const userInsertSchema = createInsertSchema(users, {
  email: z.email(),
  password: z.string().min(8),
}).omit({ id: true, createdAt: true, updatedAt: true, role: true })

export const userUpdateSchema = userInsertSchema.partial()

export const userParamsSchema = z.object({
  id: z.uuid(),
})

export const userListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const userSchema = schemaFor('users')

export const userResponse = { 200: successSchema(userSelectSchema) }
export const userCreatedResponse = { 201: successSchema(userSelectSchema) }
export const userListResponse = {
  200: paginatedSchema(userSelectSchema.array()),
}
