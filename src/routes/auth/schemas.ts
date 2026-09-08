import { z } from 'zod/v4'

export const loginBodySchema = z.object({
  email: z.email(),
  password: z.string().min(8),
})

export const loginResponseSchema = z.object({
  token: z.string(),
})

export const meResponseSchema = z.object({
  sub: z.string(),
  email: z.string(),
})
