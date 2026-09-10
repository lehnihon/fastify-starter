import fp from 'fastify-plugin'
import { client } from '../db/index.ts'

export default fp(async (fastify) => {
  fastify.addHook('onClose', async () => {
    await client.end()
  })
})
