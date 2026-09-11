import type { FastifyPluginAsync } from 'fastify'
import { authPrivateRoutes } from '#app/routes/auth/private'
import { authPublicRoutes } from '#app/routes/auth/public'

const authRoutes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(authPublicRoutes)
  await fastify.register(authPrivateRoutes)
}

export default authRoutes
