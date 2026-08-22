import type { SupportedLanguage } from './analysisRequestTypes'

export type ChatRole = 'user' | 'assistant'

export type ChatMessage = {
  role: ChatRole
  text: string
}

export type ChatRequest = {
  agreementId: string
  contentHash: string
  analysisVersion: string
  question: string
  language: SupportedLanguage
  agreementText: string
  history: ChatMessage[]
}

export type ChatConfidenceLevel = 'high' | 'medium' | 'low'

export type ChatSourceReference = {
  sectionTitle: string
  sourceIndex: string
}

export type ChatResult = {
  agreementId: string
  contentHash: string
  analysisVersion: string
  answer: string
  sourceText: string
  sourceReference: ChatSourceReference | null
  confidence: ChatConfidenceLevel
  notFound: boolean
  disclaimer: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isChatSourceReference(value: unknown): value is ChatSourceReference {
  return isRecord(value) && typeof value.sectionTitle === 'string' && typeof value.sourceIndex === 'string'
}

export function isChatResultPayload(value: unknown): value is ChatResult {
  if (!isRecord(value)) return false
  if (typeof value.agreementId !== 'string' || value.agreementId.length === 0) return false
  if (typeof value.contentHash !== 'string' || value.contentHash.length === 0) return false
  if (typeof value.analysisVersion !== 'string' || value.analysisVersion.length === 0) return false
  if (typeof value.answer !== 'string') return false
  if (typeof value.sourceText !== 'string') return false
  if (value.sourceReference !== null && !isChatSourceReference(value.sourceReference)) return false
  if (value.confidence !== 'high' && value.confidence !== 'medium' && value.confidence !== 'low') return false
  if (typeof value.notFound !== 'boolean') return false
  if (typeof value.disclaimer !== 'string') return false
  return true
}
