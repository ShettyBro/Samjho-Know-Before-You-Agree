import { randomUUID } from 'node:crypto'
import type { Pool } from 'pg'
import type { User } from './types.js'
import type { NewUser, UserRepository } from './userRepository.js'

type UserRow = {
  id: string
  email: string
  password_hash: string
  created_at: string | Date
  updated_at: string | Date
}

function toIsoString(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : value
}

function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  }
}

export function createPostgresUserRepository(pool: Pool): UserRepository {
  return {
    async findByEmail(email: string) {
      const result = await pool.query<UserRow>('SELECT * FROM users WHERE email = $1', [email])
      return result.rows[0] ? rowToUser(result.rows[0]) : undefined
    },
    async findById(id: string) {
      const result = await pool.query<UserRow>('SELECT * FROM users WHERE id = $1', [id])
      return result.rows[0] ? rowToUser(result.rows[0]) : undefined
    },
    async createUser(input: NewUser) {
      const id = randomUUID()
      const result = await pool.query<UserRow>(
        'INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
        [id, input.email, input.passwordHash],
      )
      return rowToUser(result.rows[0])
    },
  }
}
