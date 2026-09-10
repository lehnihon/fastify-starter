import { beforeEach, describe, expect, it } from 'vitest'
import { buildApp, resetDb } from '../setup.ts'

async function createUser(app: ReturnType<typeof buildApp>) {
  const res = await app.inject({
    method: 'POST',
    url: '/users',
    payload: { name: 'Ada Lovelace', email: 'ada@example.com', password: 'supersecret' },
  })
  expect(res.statusCode).toBe(201)
  return res.json()
}

describe('auth', () => {
  beforeEach(async () => {
    await resetDb()
  })

  it('logs in with valid credentials and returns a token', async () => {
    const app = buildApp()
    const user = await createUser(app)

    const res = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'ada@example.com', password: 'supersecret' },
    })

    expect(res.statusCode).toBe(200)
    expect(res.json().token).toBeTypeOf('string')

    const me = await app.inject({
      method: 'GET',
      url: '/auth/me',
      headers: { authorization: `Bearer ${res.json().token}` },
    })
    expect(me.statusCode).toBe(200)
    expect(me.json()).toEqual({ sub: user.id, email: 'ada@example.com' })
  })

  it('rejects login with a wrong password', async () => {
    const app = buildApp()
    await createUser(app)

    const res = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'ada@example.com', password: 'wrong-password' },
    })

    expect(res.statusCode).toBe(401)
  })

  it('rejects login with an unknown email', async () => {
    const app = buildApp()

    const res = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'nobody@example.com', password: 'supersecret' },
    })

    expect(res.statusCode).toBe(401)
  })

  it('rejects invalid login body', async () => {
    const app = buildApp()
    const res = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'not-an-email', password: 'x' },
    })

    expect(res.statusCode).toBe(400)
  })

  it('rejects /me without a token', async () => {
    const app = buildApp()
    const res = await app.inject({ method: 'GET', url: '/auth/me' })

    expect(res.statusCode).toBe(401)
  })
})
