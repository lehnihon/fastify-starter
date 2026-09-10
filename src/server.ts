import { buildApp } from './app.ts'
import { env } from './env.ts'

const app = buildApp()

const shutdown = (signal: string) => {
  app.log.info({ signal }, 'shutting down')
  void app
    .close()
    .then(() => process.exit(0))
    .catch((err) => {
      app.log.error(err)
      process.exit(1)
    })
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

try {
  await app.listen({ port: env.PORT, host: env.HOST })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
