import type { FastifyPluginAsync } from 'fastify'
import { userPrivateRoutes } from '#app/routes/users/private'
import { userPublicRoutes } from '#app/routes/users/public'

const userRoutes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(userPublicRoutes)
  await fastify.register(userPrivateRoutes)
}

export default userRoutes
