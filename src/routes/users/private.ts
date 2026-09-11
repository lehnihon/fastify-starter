import type { FastifyPluginAsync } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { authenticated } from '#app/lib/authenticated'
import { paginatedSchema, successSchema } from '#app/lib/http'
import {
  userListQuerySchema,
  userParamsSchema,
  userSelectSchema,
  userUpdateSchema,
} from '#app/routes/users/schemas'
import { usersService } from '#app/routes/users/service'

export const userPrivateRoutes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(
    authenticated((app) => {
      const typed = app.withTypeProvider<ZodTypeProvider>()

      typed.get(
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

      typed.put(
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

  await fastify.register(
    authenticated(
      (app) => {
        const typed = app.withTypeProvider<ZodTypeProvider>()

        typed.delete(
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
