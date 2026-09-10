import { z } from 'zod/v4'

const isTest = process.env.NODE_ENV === 'test' || process.env.VITEST === 'true'

try {
  process.loadEnvFile(isTest ? '.env.test' : '.env')
} catch {
  // no env file — rely on the real environment (e.g. production)
}

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.string().default('info'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(16),
  CORS_ORIGINS: z.string().default('*'),
  UNDER_PRESSURE_MAX_EVENT_LOOP_DELAY: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(1000),
  UNDER_PRESSURE_MAX_EVENT_LOOP_UTILIZATION: z.coerce
    .number()
    .min(0)
    .max(1)
    .default(0.98),
  UNDER_PRESSURE_MAX_HEAP_USED_BYTES: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(0),
  UNDER_PRESSURE_MAX_RSS_BYTES: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(0),
})

export const env = envSchema.parse(process.env)
