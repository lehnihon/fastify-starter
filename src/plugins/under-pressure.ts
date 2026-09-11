import underPressure from '@fastify/under-pressure'
import fp from 'fastify-plugin'
import { env } from '#app/env'

export default fp(async (fastify) => {
  await fastify.register(underPressure, {
    maxEventLoopDelay: env.UNDER_PRESSURE_MAX_EVENT_LOOP_DELAY,
    maxEventLoopUtilization: env.UNDER_PRESSURE_MAX_EVENT_LOOP_UTILIZATION,
    maxHeapUsedBytes: env.UNDER_PRESSURE_MAX_HEAP_USED_BYTES,
    maxRssBytes: env.UNDER_PRESSURE_MAX_RSS_BYTES,
    exposeStatusRoute: false,
  })
})
