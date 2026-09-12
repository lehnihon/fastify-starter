import type { User } from '#app/db/schema'
import { UnauthorizedError } from '#app/lib/errors'
import { verifyPassword } from '#app/lib/password'
import { usersRepository } from '#app/modules/users/repository'

export const authService = {
  async verifyCredentials(email: string, password: string): Promise<User> {
    const user = await usersRepository.findByEmail(email)
    if (!user) throw new UnauthorizedError('Invalid credentials')

    const valid = await verifyPassword(password, user.password)
    if (!valid) throw new UnauthorizedError('Invalid credentials')

    return user
  },
}
