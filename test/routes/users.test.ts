import { beforeEach, describe, expect, it } from 'vitest'
import { buildApp, resetDb } from '../setup.ts'

describe('users CRUD', () => {
  beforeEach(async () => {
    await resetDb()
  })

  it('creates, reads, updates and deletes a user', async () => {
    const app = buildApp()

    const create = await app.inject({
      method: 'POST',
      url: '/users',
      payload: { name: 'Ada Lovelace', email: 'ada@example.com' },
    })
    expect(create.statusCode).toBe(201)
    const created = create.json()

    const list = await app.inject({ method: 'GET', url: '/users' })
    expect(list.statusCode).toBe(200)
    expect(list.json()).toHaveLength(1)

    const get = await app.inject({ method: 'GET', url: `/users/${created.id}` })
    expect(get.statusCode).toBe(200)
    expect(get.json()).toMatchObject({ email: 'ada@example.com' })

    const update = await app.inject({
      method: 'PUT',
      url: `/users/${created.id}`,
      payload: { name: 'Ada Byron' },
    })
    expect(update.statusCode).toBe(200)
    expect(update.json().name).toBe('Ada Byron')

    const remove = await app.inject({ method: 'DELETE', url: `/users/${created.id}` })
    expect(remove.statusCode).toBe(200)

    const after = await app.inject({ method: 'GET', url: `/users/${created.id}` })
    expect(after.statusCode).toBe(404)
  })

  it('returns 404 for a missing user', async () => {
    const app = buildApp()
    const res = await app.inject({
      method: 'GET',
      url: '/users/00000000-0000-0000-0000-000000000000',
    })
    expect(res.statusCode).toBe(404)
  })

  it('rejects an invalid email on create', async () => {
    const app = buildApp()
    const res = await app.inject({
      method: 'POST',
      url: '/users',
      payload: { name: 'X', email: 'invalid' },
    })
    expect(res.statusCode).toBe(400)
  })
})
