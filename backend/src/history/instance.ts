import { getPool } from '../db/pool.js'
import { createPostgresHistoryRepository } from './postgresRepository.js'
import { createInMemoryHistoryRepository, type HistoryRepository } from './repository.js'

const pool = getPool()

export const historyRepository: HistoryRepository = pool ? createPostgresHistoryRepository(pool) : createInMemoryHistoryRepository()
