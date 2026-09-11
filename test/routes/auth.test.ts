import { describe, expect, it } from 'vitest'
import { buildApp, uniqueEmail } from '../setup.ts'

async function createUser(app: ReturnType<typeof buildApp>) {
  const email = uniqueEmail()
  const res = await app.inject({
    method: 'POST',
    url: '/users',
    payload: {
      name: 'Ada Lovelace',
      email,
      password: 'supersecret',
    },
  })
  expect(res.statusCode).toBe(201)
  return { id: res.json().data.id, email }
}

describe('auth', () => {
  it('logs in with valid credentials and returns a token', async () => {
    const app = buildApp()
    const user = await createUser(app)

    const res = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: user.email, password: 'supersecret' },
    })

    expect(res.statusCode).toBe(200)
    const { token } = res.json().data
    expect(token).toBeTypeOf('string')

    const me = await app.inject({
      method: 'GET',
      url: '/auth/me',
      headers: { authorization: `Bearer ${token}` },
    })
    expect(me.statusCode).toBe(200)
    expect(me.json().data).toEqual({
      sub: user.id,
      email: user.email,
      role: 'user',
    })
  })

  it('rejects login with a wrong password', async () => {
    const app = buildApp()
    const user = await createUser(app)

    const res = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: user.email, password: 'wrong-password' },
    })

    expect(res.statusCode).toBe(401)
    expect(res.json().error.code).toBe('UNAUTHORIZED')
  })

  it('rejects login with an unknown email', async () => {
    const app = buildApp()

    const res = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'nobody@example.com', password: 'supersecret' },
    })

    expect(res.statusCode).toBe(401)
    expect(res.json().error.code).toBe('UNAUTHORIZED')
  })

  it('rejects invalid login body', async () => {
    const app = buildApp()
    const res = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'not-an-email', password: 'x' },
    })

    expect(res.statusCode).toBe(400)
    expect(res.json().error.code).toBe('VALIDATION_ERROR')
  })

  it('rejects /me without a token', async () => {
    const app = buildApp()
    const res = await app.inject({ method: 'GET', url: '/auth/me' })

    expect(res.statusCode).toBe(401)
    expect(res.json().error.code).toBe('UNAUTHORIZED')
  })
})
