import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import type { Role } from '#app/lib/roles'

export function authenticated(
  register: (app: FastifyInstance) => void,
  roles: Role[] = [],
): FastifyPluginAsync {
  return async (fastify) => {
    await fastify.register(async (instance) => {
      instance.addHook('preHandler', fastify.authenticate)

      if (roles.length > 0) {
        instance.addHook('preHandler', fastify.authorize(...roles))
      }

      register(instance)
    })
  }
}
