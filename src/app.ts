import Fastify from 'fastify'
import type { FastifyInstance } from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { env } from './env.ts'
import swaggerPlugin from './plugins/swagger.ts'
import corsPlugin from './plugins/cors.ts'
import helmetPlugin from './plugins/helmet.ts'
import staticPlugin from './plugins/static.ts'
import sensiblePlugin from './plugins/sensible.ts'
import authPlugin from './plugins/auth.ts'
import rateLimitPlugin from './plugins/rate-limit.ts'
import healthRoutes from './routes/health.ts'
import authRoutes from './routes/auth/index.ts'
import userRoutes from './routes/users/index.ts'

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

  void app.register(swaggerPlugin)
  void app.register(corsPlugin)
  void app.register(helmetPlugin)
  void app.register(staticPlugin)
  void app.register(sensiblePlugin)
  void app.register(authPlugin)
  void app.register(rateLimitPlugin)

  void app.register(healthRoutes)
  void app.register(authRoutes, { prefix: '/auth' })
  void app.register(userRoutes, { prefix: '/users' })

  return app
}
