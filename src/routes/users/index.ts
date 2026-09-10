import type { FastifyPluginAsync } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { hashPassword } from '../../lib/password.ts'
import { usersRepository } from './repository.ts'
import {
  userInsertSchema,
  userListQuerySchema,
  userParamsSchema,
  userSelectSchema,
  userUpdateSchema,
} from './schemas.ts'

const userRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>()

  app.get(
    '/',
    {
      schema: {
        tags: ['users'],
        querystring: userListQuerySchema,
        response: { 200: userSelectSchema.array() },
      },
    },
    async (request) => {
      const { limit, offset } = request.query
      return usersRepository.list(limit, offset)
    },
  )

  app.get(
    '/:id',
    {
      schema: {
        tags: ['users'],
        params: userParamsSchema,
        response: { 200: userSelectSchema },
      },
    },
    async (request, reply) => {
      const user = await usersRepository.findById(request.params.id)
      if (!user) return reply.notFound('User not found')
      return user
    },
  )

  app.post(
    '/',
    {
      schema: {
        tags: ['users'],
        body: userInsertSchema,
        response: { 201: userSelectSchema },
      },
    },
    async (request, reply) => {
      const { password, ...data } = request.body
      const user = await usersRepository.create({
        ...data,
        password: await hashPassword(password),
      })
      return reply.code(201).send(user)
    },
  )

  app.put(
    '/:id',
    {
      schema: {
        tags: ['users'],
        params: userParamsSchema,
        body: userUpdateSchema,
        response: { 200: userSelectSchema },
      },
    },
    async (request, reply) => {
      const { password, ...data } = request.body
      const user = await usersRepository.update(request.params.id, {
        ...data,
        ...(password ? { password: await hashPassword(password) } : {}),
      })
      if (!user) return reply.notFound('User not found')
      return user
    },
  )

  app.delete(
    '/:id',
    {
      schema: {
        tags: ['users'],
        params: userParamsSchema,
        response: { 200: userSelectSchema },
      },
    },
    async (request, reply) => {
      const user = await usersRepository.remove(request.params.id)
      if (!user) return reply.notFound('User not found')
      return reply.send(user)
    },
  )
}

export default userRoutes
