import type { FastifyPluginAsync } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { successSchema } from '#app/lib/http'
import {
  userInsertSchema,
  userParamsSchema,
  userSelectSchema,
} from '#app/routes/users/schemas'
import { usersService } from '#app/routes/users/service'

export const userPublicRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>()

  app.get(
    '/:id',
    {
      schema: {
        tags: ['users'],
        params: userParamsSchema,
        response: { 200: successSchema(userSelectSchema) },
      },
    },
    async (request) => {
      return { data: await usersService.findById(request.params.id) }
    },
  )

  app.post(
    '/',
    {
      schema: {
        tags: ['users'],
        body: userInsertSchema,
        response: { 201: successSchema(userSelectSchema) },
      },
    },
    async (request, reply) => {
      const user = await usersService.create(request.body)
      return reply.code(201).send({ data: user })
    },
  )
}
