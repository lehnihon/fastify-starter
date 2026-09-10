import Fastify from 'fastify'
import type { FastifyInstance } from 'fastify'
import autoLoad from '@fastify/autoload'
import { join } from 'node:path'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { env } from './env.ts'

export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger:
      env.NODE_ENV === 'development'
        ? {
            level: env.LOG_LEVEL,
            transport: {
              target: 'pino-pretty',
              options: { translateTime: 'HH:MM:ss Z', ignore: 'pid,hostname' },
            },
          }
        : { level: env.LOG_LEVEL },
  })

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  void app.register(autoLoad, {
    dir: join(import.meta.dirname, 'plugins'),
  })

  void app.register(autoLoad, {
    dir: join(import.meta.dirname, 'routes'),
    dirNameRoutePrefix: true,
    ignorePattern: /(schemas|repository)\.(ts|js)$/,
  })

  return app
}
