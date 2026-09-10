import requestContext from '@fastify/request-context'
import fp from 'fastify-plugin'

declare module '@fastify/request-context' {
  interface RequestContextData {
    user: { sub: string; email: string } | null
  }
}

export default fp(async (fastify) => {
  await fastify.register(requestContext, {
    defaultStoreValues: { user: null },
  })
})
