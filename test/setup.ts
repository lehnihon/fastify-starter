import { randomUUID } from 'node:crypto'
import type { FastifyInstance } from 'fastify'
import { buildApp } from '../src/app.ts'
import { db } from '../src/db/index.ts'
import { users } from '../src/db/schema.ts'
import { hashPassword } from '../src/lib/password.ts'
import type { Role } from '../src/lib/roles.ts'

export function uniqueEmail() {
  return `user-${randomUUID()}@example.com`
}

export async function login(
  app: FastifyInstance,
  email: string,
  password = 'supersecret',
) {
  const res = await app.inject({
    method: 'POST',
    url: '/auth/login',
    payload: { email, password },
  })
  return res.json().data.token
}

export async function createAdmin(app: FastifyInstance) {
  const email = uniqueEmail()
  const password = 'supersecret'

  await db.insert(users).values({
    name: 'Admin',
    email,
    role: 'admin' as Role,
    password: await hashPassword(password),
  })

  return { token: await login(app, email, password), email }
}

export { buildApp }
