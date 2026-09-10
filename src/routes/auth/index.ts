import type { FastifyPluginAsync } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import {
  loginBodySchema,
  loginResponseSchema,
  meResponseSchema,
} from './schemas.ts'
import { authService } from './service.ts'

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
      config: {
        rateLimit: { max: 10, timeWindow: '1 minute' },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body

      const user = await authService.verifyCredentials(email, password)
      if (!user) {
        return reply.unauthorized('Invalid credentials')
      }

      const token = await reply.jwtSign({ sub: user.id, email: user.email })

      return { token }
    },
  )

  app.get(
    '/me',
    {
      preHandler: app.authenticate,
      schema: {
        tags: ['auth'],
        security: [{ bearerAuth: [] }],
        response: { 200: meResponseSchema },
      },
    },
    async (request) => {
      return { sub: request.user.sub, email: request.user.email }
    },
  )
}

export default authRoutes
