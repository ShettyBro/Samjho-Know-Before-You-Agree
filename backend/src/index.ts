import { createApp } from './app.js'
import { env } from './config/env.js'
import { getPool } from './db/pool.js'
import { ensureSchema } from './db/schema.js'

async function prepareDatabase(): Promise<void> {
  const pool = getPool()
  if (!pool) {
    console.log('[Samjho] DATABASE_URL not configured; authentication will use an in-memory store')
    return
  }
  try {
    await ensureSchema(pool)
    console.log('[Samjho] database schema ready')
  } catch (error) {
    console.error('[Samjho] failed to prepare database schema', error)
  }
}

const app = createApp()

void prepareDatabase().finally(() => {
  app.listen(env.port, () => {
    console.log(`Samjho backend listening on http://localhost:${env.port}`)
  })
})
