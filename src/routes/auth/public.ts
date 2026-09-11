import type { FastifyPluginAsync } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { loginBodySchema, loginResponseSchema } from '#app/routes/auth/schemas'
import { authService } from '#app/routes/auth/service'

export const authPublicRoutes: FastifyPluginAsync = async (fastify) => {
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
      const token = await reply.jwtSign({
        sub: user.id,
        email: user.email,
        role: user.role,
      })

      return { data: { token } }
    },
  )
}
