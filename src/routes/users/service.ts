import { NotFoundError } from '#app/lib/errors'
import { hashPassword } from '#app/lib/password'
import { usersRepository } from '#app/routes/users/repository'

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

export interface PaginationInput {
  page: number
  limit: number
}

export const usersService = {
  async list({ page, limit }: PaginationInput) {
    const offset = (page - 1) * limit
    const [data, total] = await Promise.all([
      usersRepository.list(limit, offset),
      usersRepository.count(),
    ])

    return {
      data,
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    }
  },

  async findById(id: string) {
    const user = await usersRepository.findById(id)
    if (!user) throw new NotFoundError('User')
    return user
  },

  async create(data: CreateUserInput) {
    const { password, ...rest } = data
    return usersRepository.create({
      ...rest,
      password: await hashPassword(password),
    })
  },

  async update(id: string, data: UpdateUserInput) {
    const { password, ...rest } = data
    const user = await usersRepository.update(id, {
      ...rest,
      ...(password ? { password: await hashPassword(password) } : {}),
    })
    if (!user) throw new NotFoundError('User')
    return user
  },

  async remove(id: string) {
    const user = await usersRepository.remove(id)
    if (!user) throw new NotFoundError('User')
    return user
  },
}
