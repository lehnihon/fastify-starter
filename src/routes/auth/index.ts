import type { FastifyPluginAsync } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { verifyPassword } from '../../lib/password.ts'
import { usersRepository } from '../users/repository.ts'
import {
  loginBodySchema,
  loginResponseSchema,
  meResponseSchema,
} from './schemas.ts'

const authRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>()

  app.post(
    '/login',
    {
      schema: {
        tags: ['auth'],
        body: loginBodySchema,
        response: { 200: loginResponseSchema },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body

      const user = await usersRepository.findByEmail(email)
      if (!user || !(await verifyPassword(password, user.password))) {
        return reply.unauthorized('Invalid credentials')
      }

      const token = await reply.jwtSign({ sub: user.id, email: user.email })

      return { token }
    },
  )

  app.get(
    '/me',
    {
      schema: {
        tags: ['auth'],
        security: [{ bearerAuth: [] }],
        response: { 200: meResponseSchema },
      },
    },
    async (request) => {
      await request.jwtVerify()
      return { sub: request.user.sub, email: request.user.email }
    },
  )
}

export default authRoutes
