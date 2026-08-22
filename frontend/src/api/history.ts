import { apiRequest, type ApiOutcome } from './client.js'
import type { AnalysisResultPayload } from './types.js'

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isHistoryListItem(value: unknown): value is HistoryListItem {
  return isRecord(value) && typeof value.agreementId === 'string' && typeof value.contentHash === 'string' && typeof value.changed === 'boolean'
}

function isSavedListItem(value: unknown): value is SavedListItem {
  return isRecord(value) && typeof value.agreementId === 'string' && typeof value.contentHash === 'string' && typeof value.changed === 'boolean'
}

function isHistoryListResponse(value: unknown): value is { items: HistoryListItem[] } {
  return isRecord(value) && Array.isArray(value.items) && value.items.every(isHistoryListItem)
}

function isSavedListResponse(value: unknown): value is { items: SavedListItem[] } {
  return isRecord(value) && Array.isArray(value.items) && value.items.every(isSavedListItem)
}

function isResultResponse(value: unknown): value is { result: AnalysisResultPayload } {
  return isRecord(value) && isRecord(value.result) && typeof value.result.agreementId === 'string'
}

export async function fetchHistory(): Promise<ApiOutcome<{ items: HistoryListItem[] }>> {
  return apiRequest('/api/v1/history', { method: 'GET' }, isHistoryListResponse)
}

export async function fetchSaved(): Promise<ApiOutcome<{ items: SavedListItem[] }>> {
  return apiRequest('/api/v1/agreements/saved', { method: 'GET' }, isSavedListResponse)
}

export async function fetchHistoryResult(agreementId: string): Promise<ApiOutcome<{ result: AnalysisResultPayload }>> {
  return apiRequest(`/api/v1/history/${encodeURIComponent(agreementId)}`, { method: 'GET' }, isResultResponse)
}

export async function fetchSavedResult(agreementId: string): Promise<ApiOutcome<{ result: AnalysisResultPayload }>> {
  return apiRequest(`/api/v1/agreements/saved/${encodeURIComponent(agreementId)}`, { method: 'GET' }, isResultResponse)
}

export async function saveAgreement(entry: {
  agreementId: string
  contentHash: string
  analysisVersion: string
  title: string
  sourceUrl?: string
  result: AnalysisResultPayload
}): Promise<ApiOutcome<{ ok: true }>> {
  return apiRequest(
    '/api/v1/agreements/saved',
    { method: 'POST', body: JSON.stringify(entry) },
    (value): value is { ok: true } => isRecord(value) && value.ok === true,
  )
}

export async function unsaveAgreement(agreementId: string): Promise<ApiOutcome<{ ok: true }>> {
  return apiRequest(
    `/api/v1/agreements/saved/${encodeURIComponent(agreementId)}`,
    { method: 'DELETE' },
    (value): value is { ok: true } => isRecord(value) && value.ok === true,
  )
}
