import type { FastifyPluginAsync } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { authenticated } from '#app/lib/authenticated'
import { paginatedSchema, successSchema } from '#app/lib/http'
import {
  userInsertSchema,
  userListQuerySchema,
  userParamsSchema,
  userSelectSchema,
  userUpdateSchema,
} from '#app/routes/users/schemas'
import { usersService } from '#app/routes/users/service'

const userRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>()

  // Public routes
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

  // Authenticated routes
  await fastify.register(
    authenticated((instance) => {
      const app = instance.withTypeProvider<ZodTypeProvider>()

      app.get(
        '/',
        {
          schema: {
            tags: ['users'],
            security: [{ bearerAuth: [] }],
            querystring: userListQuerySchema,
            response: { 200: paginatedSchema(userSelectSchema.array()) },
          },
        },
        async (request) => {
          return usersService.list(request.query)
        },
      )

      app.put(
        '/:id',
        {
          schema: {
            tags: ['users'],
            security: [{ bearerAuth: [] }],
            params: userParamsSchema,
            body: userUpdateSchema,
            response: { 200: successSchema(userSelectSchema) },
          },
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
            schema: {
              tags: ['users'],
              security: [{ bearerAuth: [] }],
              params: userParamsSchema,
              response: { 200: successSchema(userSelectSchema) },
            },
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
