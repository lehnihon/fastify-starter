import { hashPassword } from '../../lib/password.ts'
import { usersRepository } from './repository.ts'

export interface CreateUserInput {
  name: string
  email: string
  password: string
}

export interface UpdateUserInput {
  name?: string
  email?: string
  password?: string
}

export const usersService = {
  async create(data: CreateUserInput) {
    const { password, ...rest } = data
    return usersRepository.create({
      ...rest,
      password: await hashPassword(password),
    })
  },

  async update(id: string, data: UpdateUserInput) {
    const { password, ...rest } = data
    return usersRepository.update(id, {
      ...rest,
      ...(password ? { password: await hashPassword(password) } : {}),
    })
  },
}
