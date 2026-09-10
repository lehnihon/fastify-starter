import fp from 'fastify-plugin'
import jwt from '@fastify/jwt'
import { env } from '../env.ts'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { sub: string; email: string }
    user: { sub: string; email: string }
  }
}

export default fp(async (fastify) => {
  await fastify.register(jwt, {
    secret: env.JWT_SECRET,
  })
})
