import { randomUUID } from 'node:crypto'
import { buildApp } from '../src/app.ts'

export function uniqueEmail() {
  return `user-${randomUUID()}@example.com`
}

export { buildApp }
