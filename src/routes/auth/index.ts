import type { FastifyPluginAsync } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { authenticated } from '#app/lib/authenticated'
import {
  authSchema,
  loginBodySchema,
  loginResponseSchema,
  meResponseSchema,
} from '#app/modules/auth/schemas'
import { authService } from '#app/modules/auth/service'

const authRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>()

  // Public route
  app.post(
    '/login',
    {
      schema: authSchema({
        body: loginBodySchema,
        response: { 200: loginResponseSchema },
      }),
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

  // Authenticated route
  await fastify.register(
    authenticated((instance) => {
      const app = instance.withTypeProvider<ZodTypeProvider>()

      app.get(
        '/me',
        {
          schema: authSchema({
            response: { 200: meResponseSchema },
          }),
        },
        async (request) => {
          return {
            data: {
              sub: request.user.sub,
              email: request.user.email,
              role: request.user.role,
            },
          }
        },
      )
    }),
  )
}

export default authRoutes
