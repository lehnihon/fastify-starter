import fp from 'fastify-plugin'

export default fp(async (fastify) => {
  fastify.addHook('onRequest', async (request, reply) => {
    request.requestContext.set('requestId', request.id)
    reply.header('x-request-id', request.id)
  })
})
