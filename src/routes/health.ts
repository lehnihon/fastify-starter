import { sql } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { db } from '../db/index.ts'

const okResponseSchema = z.object({ status: z.literal('ok') })
const unavailableResponseSchema = z.object({ status: z.literal('unavailable') })

const healthRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>()

  app.get(
    '/health',
    {
      schema: {
        tags: ['health'],
        response: { 200: okResponseSchema },
      },
    },
    async () => ({ status: 'ok' as const }),
  )

  app.get(
    '/health/ready',
    {
      schema: {
        tags: ['health'],
        response: {
          200: okResponseSchema,
          503: unavailableResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        await db.execute(sql`SELECT 1`)
        return { status: 'ok' as const }
      } catch (err) {
        request.log.error(err, 'readiness check failed')
        return reply.code(503).send({ status: 'unavailable' as const })
      }
    },
  )
}

export default healthRoutes
