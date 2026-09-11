import fp from 'fastify-plugin'
import { client } from '#app/db/index'

export default fp(async (fastify) => {
  fastify.addHook('onClose', async () => {
    await client.end()
  })
})
