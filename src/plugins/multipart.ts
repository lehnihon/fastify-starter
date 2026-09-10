import fastifyMultipart from '@fastify/multipart'
import fp from 'fastify-plugin'

export default fp(async (fastify) => {
  await fastify.register(fastifyMultipart)

  fastify.addHook('preValidation', async (request) => {
    if (!request.isMultipart()) {
      return
    }

    const body: Record<string, unknown> = {}
    const parts = request.parts()
    for await (const part of parts) {
      if (part.type === 'field') {
        body[part.fieldname] = part.value
      }
    }

    request.body = body
  })
})
