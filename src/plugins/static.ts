import fp from 'fastify-plugin'
import fastifyStatic from '@fastify/static'
import { fileURLToPath } from 'node:url'

export default fp(async (fastify) => {
  await fastify.register(fastifyStatic, {
    root: fileURLToPath(new URL('../../public', import.meta.url)),
  })
})
