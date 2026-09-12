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

export function schemaFor(tag: string) {
  return <T extends object>(extra: T): { tags: string[] } & T => {
    return { tags: [tag], ...extra } as { tags: string[] } & T
  }
}
