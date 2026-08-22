import type { AnalysisResult } from '../analysis/types.js'

export type HistoryRow = {
  userId: string
  agreementId: string
  contentHash: string
  analysisVersion: string
  title: string
  sourceUrl?: string
  analyzedAt: string
  previousContentHash?: string
  previousAnalyzedAt?: string
  structuredResult: AnalysisResult
}

export type SavedRow = {
  userId: string
  agreementId: string
  contentHash: string
  analysisVersion: string
  title: string
  sourceUrl?: string
  savedAt: string
  structuredResult: AnalysisResult
}

export type HistoryListItem = {
  agreementId: string
  contentHash: string
  analysisVersion: string
  title: string
  sourceUrl?: string
  analyzedAt: string
  changed: boolean
  previousContentHash?: string
  previousAnalyzedAt?: string
}

export type SavedListItem = {
  agreementId: string
  contentHash: string
  analysisVersion: string
  title: string
  sourceUrl?: string
  savedAt: string
  changed: boolean
  latestContentHash?: string
  latestAnalyzedAt?: string
}

export type RecordHistoryInput = {
  userId: string
  agreementId: string
  contentHash: string
  analysisVersion: string
  title: string
  sourceUrl?: string
  structuredResult: AnalysisResult
}

export type SaveAgreementInput = {
  userId: string
  agreementId: string
  contentHash: string
  analysisVersion: string
  title: string
  sourceUrl?: string
  structuredResult: AnalysisResult
}

function toHistoryListItem(row: HistoryRow): HistoryListItem {
  return {
    agreementId: row.agreementId,
    contentHash: row.contentHash,
    analysisVersion: row.analysisVersion,
    title: row.title,
    sourceUrl: row.sourceUrl,
    analyzedAt: row.analyzedAt,
    changed: row.previousContentHash !== undefined && row.previousContentHash !== row.contentHash,
    previousContentHash: row.previousContentHash,
    previousAnalyzedAt: row.previousAnalyzedAt,
  }
}

export function toHistoryListItems(rows: HistoryRow[]): HistoryListItem[] {
  return rows.map(toHistoryListItem)
}

export function toSavedListItem(row: SavedRow, latestHistoryRow: HistoryRow | undefined): SavedListItem {
  const latestContentHash = latestHistoryRow?.contentHash
  return {
    agreementId: row.agreementId,
    contentHash: row.contentHash,
    analysisVersion: row.analysisVersion,
    title: row.title,
    sourceUrl: row.sourceUrl,
    savedAt: row.savedAt,
    changed: latestContentHash !== undefined && latestContentHash !== row.contentHash,
    latestContentHash,
    latestAnalyzedAt: latestHistoryRow?.analyzedAt,
  }
}
