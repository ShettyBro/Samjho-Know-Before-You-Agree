import { randomUUID } from 'node:crypto'
import type { User } from './types.js'

export type NewUser = { email: string; passwordHash: string }

export interface UserRepository {
  findByEmail(email: string): Promise<User | undefined>
  findById(id: string): Promise<User | undefined>
  createUser(input: NewUser): Promise<User>
}

export function createInMemoryUserRepository(): UserRepository {
  const usersByEmail = new Map<string, User>()
  const usersById = new Map<string, User>()

  return {
    async findByEmail(email: string) {
      return usersByEmail.get(email)
    },
    async findById(id: string) {
      return usersById.get(id)
    },
    async createUser(input: NewUser) {
      const now = new Date().toISOString()
      const user: User = {
        id: randomUUID(),
        email: input.email,
        passwordHash: input.passwordHash,
        createdAt: now,
        updatedAt: now,
      }
      usersByEmail.set(user.email, user)
      usersById.set(user.id, user)
      return user
    },
  }
}
