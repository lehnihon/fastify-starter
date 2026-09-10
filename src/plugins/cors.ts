import cors from '@fastify/cors'
import fp from 'fastify-plugin'
import { env } from '../env.ts'

export default fp(async (fastify) => {
  const origins = env.CORS_ORIGINS === '*' ? true : env.CORS_ORIGINS.split(',')

  await fastify.register(cors, {
    origin: origins,
  })
})
