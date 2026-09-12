import { randomUUID } from 'node:crypto'
import { join } from 'node:path'
import autoLoad from '@fastify/autoload'
import type { FastifyInstance, FastifyServerOptions } from 'fastify'
import Fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { env } from '#app/env'

export interface BuildAppOptions {
  logger?: FastifyServerOptions['logger']
  prefix?: string
}

export function buildApp(options: BuildAppOptions = {}): FastifyInstance {
  const app = Fastify({
    logger:
      options.logger ??
      (env.NODE_ENV === 'development'
        ? {
            level: env.LOG_LEVEL,
            transport: {
              target: 'pino-pretty',
              options: { translateTime: 'HH:MM:ss Z', ignore: 'pid,hostname' },
            },
          }
        : { level: env.LOG_LEVEL }),
    genReqId: (req) => {
      const id = req.headers['x-request-id']
      return typeof id === 'string' && id.length > 0 ? id : randomUUID()
    },
  })

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  void app.register(autoLoad, {
    dir: join(import.meta.dirname, 'plugins'),
  })

  void app.register(
    async (instance) => {
      await instance.register(autoLoad, {
        dir: join(import.meta.dirname, 'routes'),
        dirNameRoutePrefix: true,
      })
    },
    { prefix: options.prefix },
  )

  return app
}
