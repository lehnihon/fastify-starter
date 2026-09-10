import type { User } from '../../db/schema.ts'
import { verifyPassword } from '../../lib/password.ts'
import { usersRepository } from '../users/repository.ts'

export const authService = {
  async verifyCredentials(
    email: string,
    password: string,
  ): Promise<User | null> {
    const user = await usersRepository.findByEmail(email)
    if (!user) return null

    const valid = await verifyPassword(password, user.password)
    return valid ? user : null
  },
}
