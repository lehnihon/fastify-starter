import { describe, expect, it } from 'vitest'
import { buildApp } from '../setup.ts'

describe('auth', () => {
  it('logs in and returns a token', async () => {
    const app = buildApp()
    const res = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'ada@example.com', password: 'supersecret' },
    })

    expect(res.statusCode).toBe(200)
    expect(res.json().token).toBeTypeOf('string')
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

  it('returns the current user when authenticated', async () => {
    const app = buildApp()

    const login = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'ada@example.com', password: 'supersecret' },
    })

    const cookie = login.cookies.find((c) => c.name === 'token')?.value
    expect(cookie).toBeDefined()

    const res = await app.inject({
      method: 'GET',
      url: '/auth/me',
      headers: { cookie: `token=${cookie}` },
    })

    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual({ sub: 'demo', email: 'ada@example.com' })
  })

  it('rejects /me without a token', async () => {
    const app = buildApp()
    const res = await app.inject({ method: 'GET', url: '/auth/me' })

    expect(res.statusCode).toBe(401)
  })
})
