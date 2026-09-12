import type { FastifyPluginAsync } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { authenticated } from '#app/lib/authenticated'
import {
  userCreatedResponse,
  userInsertSchema,
  userListQuerySchema,
  userListResponse,
  userParamsSchema,
  userResponse,
  userSchema,
  userUpdateSchema,
} from '#app/modules/users/schemas'
import { usersService } from '#app/modules/users/service'

const userRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>()

  // Public routes
  app.get(
    '/:id',
    {
      schema: userSchema({
        params: userParamsSchema,
        response: userResponse,
      }),
    },
    async (request) => {
      return { data: await usersService.findById(request.params.id) }
    },
  )

  app.post(
    '/',
    {
      schema: userSchema({
        body: userInsertSchema,
        response: userCreatedResponse,
      }),
    },
    async (request, reply) => {
      const user = await usersService.create(request.body)
      return reply.code(201).send({ data: user })
    },
  )

  // Authenticated routes
  await fastify.register(
    authenticated((instance) => {
      const app = instance.withTypeProvider<ZodTypeProvider>()

      app.get(
        '/',
        {
          schema: userSchema({
            querystring: userListQuerySchema,
            response: userListResponse,
          }),
        },
        async (request) => {
          return usersService.list(request.query)
        },
      )

      app.put(
        '/:id',
        {
          schema: userSchema({
            params: userParamsSchema,
            body: userUpdateSchema,
            response: userResponse,
          }),
        },
        async (request) => {
          return {
            data: await usersService.update(request.params.id, request.body),
          }
        },
      )
    }),
  )

  // Admin-only routes
  await fastify.register(
    authenticated(
      (instance) => {
        const app = instance.withTypeProvider<ZodTypeProvider>()

        app.delete(
          '/:id',
          {
            schema: userSchema({
              params: userParamsSchema,
              response: userResponse,
            }),
          },
          async (request) => {
            return { data: await usersService.remove(request.params.id) }
          },
        )
      },
      ['admin'],
    ),
  )
}

export default userRoutes
