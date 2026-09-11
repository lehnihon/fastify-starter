import { z } from 'zod/v4'
import { successSchema } from '#app/lib/http'

export const loginBodySchema = z.object({
  email: z.email(),
  password: z.string().min(8),
})

export const loginResponseSchema = successSchema(
  z.object({ token: z.string() }),
)

export const meResponseSchema = successSchema(
  z.object({ sub: z.string(), email: z.string() }),
)
