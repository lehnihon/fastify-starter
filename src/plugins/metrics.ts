import type { FastifyPluginCallback } from 'fastify'
import type { IMetricsPluginOptions } from 'fastify-metrics'
import * as metrics from 'fastify-metrics'
import fp from 'fastify-plugin'
import { env } from '#app/env'

export default fp(async (fastify) => {
  if (env.NODE_ENV === 'test') {
    return
  }

  await fastify.register(
    metrics.default as unknown as FastifyPluginCallback<
      Partial<IMetricsPluginOptions>
    >,
    { endpoint: '/metrics' },
  )
})
