import { getPool } from '../db/pool.js'
import { createPostgresUserRepository } from './postgresUserRepository.js'
import { createInMemoryUserRepository, type UserRepository } from './userRepository.js'

const pool = getPool()

export const userRepository: UserRepository = pool ? createPostgresUserRepository(pool) : createInMemoryUserRepository()
