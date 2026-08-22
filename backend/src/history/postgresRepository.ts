import type { Pool } from 'pg'
import type { AnalysisResult } from '../analysis/types.js'
import type { HistoryRepository } from './repository.js'
import type { HistoryRow, RecordHistoryInput, SaveAgreementInput, SavedRow } from './types.js'

type HistoryRowRecord = {
  user_id: string
  agreement_id: string
  content_hash: string
  analysis_version: string
  title: string
  source_url: string | null
  analyzed_at: string | Date
  previous_content_hash: string | null
  previous_analyzed_at: string | Date | null
  structured_result: AnalysisResult
}

type SavedRowRecord = {
  user_id: string
  agreement_id: string
  content_hash: string
  analysis_version: string
  title: string
  source_url: string | null
  saved_at: string | Date
  structured_result: AnalysisResult
}

function toIso(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : value
}

function rowToHistory(row: HistoryRowRecord): HistoryRow {
  return {
    userId: row.user_id,
    agreementId: row.agreement_id,
    contentHash: row.content_hash,
    analysisVersion: row.analysis_version,
    title: row.title,
    sourceUrl: row.source_url ?? undefined,
    analyzedAt: toIso(row.analyzed_at),
    previousContentHash: row.previous_content_hash ?? undefined,
    previousAnalyzedAt: row.previous_analyzed_at ? toIso(row.previous_analyzed_at) : undefined,
    structuredResult: row.structured_result,
  }
}

function rowToSaved(row: SavedRowRecord): SavedRow {
  return {
    userId: row.user_id,
    agreementId: row.agreement_id,
    contentHash: row.content_hash,
    analysisVersion: row.analysis_version,
    title: row.title,
    sourceUrl: row.source_url ?? undefined,
    savedAt: toIso(row.saved_at),
    structuredResult: row.structured_result,
  }
}

export function createPostgresHistoryRepository(pool: Pool): HistoryRepository {
  return {
    async recordHistory(input: RecordHistoryInput) {
      const existingResult = await pool.query<HistoryRowRecord>(
        'SELECT * FROM agreement_history WHERE user_id = $1 AND agreement_id = $2',
        [input.userId, input.agreementId],
      )
      const existing = existingResult.rows[0] ? rowToHistory(existingResult.rows[0]) : undefined
      const changed = existing !== undefined && existing.contentHash !== input.contentHash
      const previousContentHash = changed ? existing!.contentHash : (existing?.previousContentHash ?? null)
      const previousAnalyzedAt = changed ? existing!.analyzedAt : (existing?.previousAnalyzedAt ?? null)

      const result = await pool.query<HistoryRowRecord>(
        `INSERT INTO agreement_history
           (user_id, agreement_id, content_hash, analysis_version, title, source_url, previous_content_hash, previous_analyzed_at, structured_result)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (user_id, agreement_id) DO UPDATE SET
           content_hash = EXCLUDED.content_hash,
           analysis_version = EXCLUDED.analysis_version,
           title = EXCLUDED.title,
           source_url = EXCLUDED.source_url,
           analyzed_at = now(),
           previous_content_hash = EXCLUDED.previous_content_hash,
           previous_analyzed_at = EXCLUDED.previous_analyzed_at,
           structured_result = EXCLUDED.structured_result
         RETURNING *`,
        [
          input.userId,
          input.agreementId,
          input.contentHash,
          input.analysisVersion,
          input.title,
          input.sourceUrl ?? null,
          previousContentHash,
          previousAnalyzedAt,
          input.structuredResult,
        ],
      )
      return rowToHistory(result.rows[0])
    },

    async listHistory(userId: string, limit: number) {
      const result = await pool.query<HistoryRowRecord>(
        'SELECT * FROM agreement_history WHERE user_id = $1 ORDER BY analyzed_at DESC LIMIT $2',
        [userId, limit],
      )
      return result.rows.map(rowToHistory)
    },

    async getHistoryRow(userId: string, agreementId: string) {
      const result = await pool.query<HistoryRowRecord>(
        'SELECT * FROM agreement_history WHERE user_id = $1 AND agreement_id = $2',
        [userId, agreementId],
      )
      return result.rows[0] ? rowToHistory(result.rows[0]) : undefined
    },

    async saveAgreement(input: SaveAgreementInput) {
      await pool.query(
        `INSERT INTO saved_agreements
           (user_id, agreement_id, content_hash, analysis_version, title, source_url, structured_result)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (user_id, agreement_id) DO NOTHING`,
        [input.userId, input.agreementId, input.contentHash, input.analysisVersion, input.title, input.sourceUrl ?? null, input.structuredResult],
      )
      const result = await pool.query<SavedRowRecord>(
        'SELECT * FROM saved_agreements WHERE user_id = $1 AND agreement_id = $2',
        [input.userId, input.agreementId],
      )
      return rowToSaved(result.rows[0])
    },

    async unsaveAgreement(userId: string, agreementId: string) {
      await pool.query('DELETE FROM saved_agreements WHERE user_id = $1 AND agreement_id = $2', [userId, agreementId])
    },

    async listSaved(userId: string, limit: number) {
      const result = await pool.query<SavedRowRecord>(
        'SELECT * FROM saved_agreements WHERE user_id = $1 ORDER BY saved_at DESC LIMIT $2',
        [userId, limit],
      )
      return result.rows.map(rowToSaved)
    },

    async getSavedRow(userId: string, agreementId: string) {
      const result = await pool.query<SavedRowRecord>(
        'SELECT * FROM saved_agreements WHERE user_id = $1 AND agreement_id = $2',
        [userId, agreementId],
      )
      return result.rows[0] ? rowToSaved(result.rows[0]) : undefined
    },
  }
}
