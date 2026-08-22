import type { Pool } from 'pg'

export async function ensureSchema(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS agreement_history (
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      agreement_id TEXT NOT NULL,
      content_hash TEXT NOT NULL,
      analysis_version TEXT NOT NULL,
      title TEXT NOT NULL,
      source_url TEXT,
      analyzed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      previous_content_hash TEXT,
      previous_analyzed_at TIMESTAMPTZ,
      structured_result JSONB NOT NULL,
      PRIMARY KEY (user_id, agreement_id)
    )
  `)
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_agreement_history_user_analyzed ON agreement_history (user_id, analyzed_at DESC)
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS saved_agreements (
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      agreement_id TEXT NOT NULL,
      content_hash TEXT NOT NULL,
      analysis_version TEXT NOT NULL,
      title TEXT NOT NULL,
      source_url TEXT,
      saved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      structured_result JSONB NOT NULL,
      PRIMARY KEY (user_id, agreement_id)
    )
  `)
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_saved_agreements_user_saved ON saved_agreements (user_id, saved_at DESC)
  `)
}
