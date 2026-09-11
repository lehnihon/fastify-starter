import type { FastifyPluginAsync } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import {
  loginBodySchema,
  loginResponseSchema,
  meResponseSchema,
} from '#app/routes/auth/schemas'
import { authService } from '#app/routes/auth/service'

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
      const token = await reply.jwtSign({ sub: user.id, email: user.email })

      return { data: { token } }
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
      return { data: { sub: request.user.sub, email: request.user.email } }
    },
  )
}

export default authRoutes
