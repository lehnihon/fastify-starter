import { fileURLToPath } from 'node:url'
import fastifyStatic from '@fastify/static'
import fp from 'fastify-plugin'

export default fp(async (fastify) => {
  await fastify.register(fastifyStatic, {
    root: fileURLToPath(new URL('../../public', import.meta.url)),
  })
})
