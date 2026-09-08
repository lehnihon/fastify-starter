import { buildApp } from './app.ts'
import { env } from './env.ts'

const app = buildApp()

try {
  await app.listen({ port: env.PORT, host: env.HOST })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
