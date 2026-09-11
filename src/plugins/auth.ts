import jwt from '@fastify/jwt'
import type { FastifyReply, FastifyRequest } from 'fastify'
import fp from 'fastify-plugin'
import { env } from '#app/env'
import { ForbiddenError, UnauthorizedError } from '#app/lib/errors'
import type { Role } from '#app/lib/roles'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { sub: string; email: string; role: Role }
    user: { sub: string; email: string; role: Role }
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>
    authorize: (...roles: Role[]) => (request: FastifyRequest) => Promise<void>
  }
}

export default fp(async (fastify) => {
  await fastify.register(jwt, {
    secret: env.JWT_SECRET,
    sign: { expiresIn: '30d' },
  })

  fastify.decorate(
    'authenticate',
    async (request: FastifyRequest, _reply: FastifyReply) => {
      try {
        await request.jwtVerify()
      } catch {
        throw new UnauthorizedError('Invalid or expired token')
      }

      request.requestContext.set('user', request.user)
    },
  )

  fastify.decorate(
    'authorize',
    (...roles: Role[]) =>
      async (request: FastifyRequest) => {
        if (!request.user) {
          throw new UnauthorizedError('Invalid or expired token')
        }

        if (!roles.includes(request.user.role)) {
          throw new ForbiddenError('Insufficient permissions')
        }
      },
  )
})
