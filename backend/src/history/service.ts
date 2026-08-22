import type { HistoryRepository } from './repository.js'
import {
  toHistoryListItems,
  toSavedListItem,
  type HistoryListItem,
  type RecordHistoryInput,
  type SaveAgreementInput,
  type SavedListItem,
} from './types.js'

const MAX_HISTORY_ITEMS = 50
const MAX_SAVED_ITEMS = 50

export async function recordHistory(input: RecordHistoryInput, repository: HistoryRepository): Promise<void> {
  await repository.recordHistory(input)
}

export async function listHistory(userId: string, repository: HistoryRepository): Promise<HistoryListItem[]> {
  const rows = await repository.listHistory(userId, MAX_HISTORY_ITEMS)
  return toHistoryListItems(rows)
}

export async function getHistoryResult(userId: string, agreementId: string, repository: HistoryRepository) {
  const row = await repository.getHistoryRow(userId, agreementId)
  return row?.structuredResult
}

export async function saveAgreement(input: SaveAgreementInput, repository: HistoryRepository): Promise<void> {
  await repository.saveAgreement(input)
}

export async function unsaveAgreement(userId: string, agreementId: string, repository: HistoryRepository): Promise<void> {
  await repository.unsaveAgreement(userId, agreementId)
}

export async function listSaved(userId: string, repository: HistoryRepository): Promise<SavedListItem[]> {
  const rows = await repository.listSaved(userId, MAX_SAVED_ITEMS)
  const items = await Promise.all(
    rows.map(async (row) => {
      const latest = await repository.getHistoryRow(userId, row.agreementId)
      return toSavedListItem(row, latest)
    }),
  )
  return items
}

export async function getSavedResult(userId: string, agreementId: string, repository: HistoryRepository) {
  const row = await repository.getSavedRow(userId, agreementId)
  return row?.structuredResult
}
