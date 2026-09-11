import { describe, expect, it } from 'vitest'
import { buildApp, uniqueEmail } from '../setup.ts'

describe('users CRUD', () => {
  it('creates, reads, updates and deletes a user', async () => {
    const app = buildApp()
    const email = uniqueEmail()

    const create = await app.inject({
      method: 'POST',
      url: '/users',
      payload: {
        name: 'Ada Lovelace',
        email,
        password: 'supersecret',
      },
    })
    expect(create.statusCode).toBe(201)
    const created = create.json().data
    expect(created.password).toBeUndefined()

    const get = await app.inject({ method: 'GET', url: `/users/${created.id}` })
    expect(get.statusCode).toBe(200)
    expect(get.json().data).toMatchObject({ email })

    const update = await app.inject({
      method: 'PUT',
      url: `/users/${created.id}`,
      payload: { name: 'Ada Byron' },
    })
    expect(update.statusCode).toBe(200)
    expect(update.json().data.name).toBe('Ada Byron')

    const remove = await app.inject({
      method: 'DELETE',
      url: `/users/${created.id}`,
    })
    expect(remove.statusCode).toBe(200)

    const after = await app.inject({
      method: 'GET',
      url: `/users/${created.id}`,
    })
    expect(after.statusCode).toBe(404)
    expect(after.json()).toMatchObject({
      error: { code: 'NOT_FOUND', statusCode: 404 },
    })
  })

  it('lists users with pagination', async () => {
    const app = buildApp()
    const res = await app.inject({
      method: 'GET',
      url: '/users?page=1&limit=5',
    })

    expect(res.statusCode).toBe(200)
    expect(Array.isArray(res.json().data)).toBe(true)
    expect(res.json().meta.pagination).toMatchObject({ page: 1, limit: 5 })
  })

  it('returns 404 for a missing user', async () => {
    const app = buildApp()
    const res = await app.inject({
      method: 'GET',
      url: '/users/00000000-0000-0000-0000-000000000000',
    })
    expect(res.statusCode).toBe(404)
    expect(res.json().error.code).toBe('NOT_FOUND')
  })

  it('rejects an invalid email on create', async () => {
    const app = buildApp()
    const res = await app.inject({
      method: 'POST',
      url: '/users',
      payload: { name: 'X', email: 'invalid', password: 'supersecret' },
    })
    expect(res.statusCode).toBe(400)
    expect(res.json().error.code).toBe('VALIDATION_ERROR')
  })

  it('rejects a short password on create', async () => {
    const app = buildApp()
    const res = await app.inject({
      method: 'POST',
      url: '/users',
      payload: { name: 'Ada', email: uniqueEmail(), password: 'x' },
    })
    expect(res.statusCode).toBe(400)
    expect(res.json().error.code).toBe('VALIDATION_ERROR')
  })
})
