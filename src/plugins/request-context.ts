import requestContext from '@fastify/request-context'
import fp from 'fastify-plugin'
import type { Role } from '#app/lib/roles'

declare module '@fastify/request-context' {
  interface RequestContextData {
    requestId: string | null
    user: { sub: string; email: string; role: Role } | null
  }
}

export default fp(async (fastify) => {
  await fastify.register(requestContext, {
    defaultStoreValues: { requestId: null, user: null },
  })
})
