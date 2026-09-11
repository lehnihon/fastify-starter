import { z } from 'zod/v4'

export const paginationMetaSchema = z.object({
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
})

export function successSchema<T extends z.ZodTypeAny>(data: T) {
  return z.object({ data })
}

export function paginatedSchema<T extends z.ZodTypeAny>(data: T) {
  return z.object({ data, meta: paginationMetaSchema })
}
