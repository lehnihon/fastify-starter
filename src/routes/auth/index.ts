import type { FastifyPluginAsync } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
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
      // TODO: verify the user against the DB (and hash the password with argon2/bcrypt).
      const { email } = request.body

      const token = await reply.jwtSign({ sub: 'demo', email })

      reply.setCookie('token', token, {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
      })

      return { token }
    },
  )

  app.get(
    '/me',
    {
      schema: {
        tags: ['auth'],
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
