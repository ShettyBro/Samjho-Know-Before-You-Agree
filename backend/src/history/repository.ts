import type { HistoryRow, RecordHistoryInput, SaveAgreementInput, SavedRow } from './types.js'

export interface HistoryRepository {
  recordHistory(input: RecordHistoryInput): Promise<HistoryRow>
  listHistory(userId: string, limit: number): Promise<HistoryRow[]>
  getHistoryRow(userId: string, agreementId: string): Promise<HistoryRow | undefined>
  saveAgreement(input: SaveAgreementInput): Promise<SavedRow>
  unsaveAgreement(userId: string, agreementId: string): Promise<void>
  listSaved(userId: string, limit: number): Promise<SavedRow[]>
  getSavedRow(userId: string, agreementId: string): Promise<SavedRow | undefined>
}

function historyKey(userId: string, agreementId: string): string {
  return `${userId}:${agreementId}`
}

export function createInMemoryHistoryRepository(): HistoryRepository {
  const history = new Map<string, HistoryRow>()
  const saved = new Map<string, SavedRow>()

  return {
    async recordHistory(input: RecordHistoryInput) {
      const key = historyKey(input.userId, input.agreementId)
      const existing = history.get(key)
      const now = new Date().toISOString()
      const changed = existing !== undefined && existing.contentHash !== input.contentHash

      const row: HistoryRow = {
        userId: input.userId,
        agreementId: input.agreementId,
        contentHash: input.contentHash,
        analysisVersion: input.analysisVersion,
        title: input.title,
        sourceUrl: input.sourceUrl,
        analyzedAt: now,
        previousContentHash: changed ? existing!.contentHash : existing?.previousContentHash,
        previousAnalyzedAt: changed ? existing!.analyzedAt : existing?.previousAnalyzedAt,
        structuredResult: input.structuredResult,
      }
      history.set(key, row)
      return row
    },

    async listHistory(userId: string, limit: number) {
      return Array.from(history.values())
        .filter((row) => row.userId === userId)
        .sort((a, b) => Date.parse(b.analyzedAt) - Date.parse(a.analyzedAt))
        .slice(0, limit)
    },

    async getHistoryRow(userId: string, agreementId: string) {
      return history.get(historyKey(userId, agreementId))
    },

    async saveAgreement(input: SaveAgreementInput) {
      const key = historyKey(input.userId, input.agreementId)
      const existing = saved.get(key)
      if (existing) return existing

      const row: SavedRow = {
        userId: input.userId,
        agreementId: input.agreementId,
        contentHash: input.contentHash,
        analysisVersion: input.analysisVersion,
        title: input.title,
        sourceUrl: input.sourceUrl,
        savedAt: new Date().toISOString(),
        structuredResult: input.structuredResult,
      }
      saved.set(key, row)
      return row
    },

    async unsaveAgreement(userId: string, agreementId: string) {
      saved.delete(historyKey(userId, agreementId))
    },

    async listSaved(userId: string, limit: number) {
      return Array.from(saved.values())
        .filter((row) => row.userId === userId)
        .sort((a, b) => Date.parse(b.savedAt) - Date.parse(a.savedAt))
        .slice(0, limit)
    },

    async getSavedRow(userId: string, agreementId: string) {
      return saved.get(historyKey(userId, agreementId))
    },
  }
}
