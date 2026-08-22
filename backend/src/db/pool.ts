import pg from 'pg'
import { env } from '../config/env.js'

let pool: pg.Pool | undefined

export function getPool(): pg.Pool | undefined {
  if (!env.database.url) return undefined
  if (!pool) {
    pool = new pg.Pool({ connectionString: env.database.url })
  }
  return pool
}
