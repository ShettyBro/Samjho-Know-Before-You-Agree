export type SupportedLanguage = 'en' | 'kn' | 'hi'

export type AttentionItemPayload = {
  id: string
  category: string
  importance: 'high' | 'medium' | 'low'
  title: string
  explanation: string
  sourceReference: {
    headingPath: string[]
    containerDescriptor: string
    sourceIndex: number
    sourceUrl?: string
    sourceType: string
  }
  sourceText: string
  confidence: 'high' | 'medium' | 'low'
}

export type AnalysisSectionPayload = {
  available: boolean
  summary: string[]
  relatedAttentionItemIds: string[]
}

export type AnalysisResultPayload = {
  agreementId: string
  contentHash: string
  analysisVersion: string
  summary: string[]
  attentionItems: AttentionItemPayload[]
  obligations: AnalysisSectionPayload
  charges: AnalysisSectionPayload
  renewals: AnalysisSectionPayload
  cancellation: AnalysisSectionPayload
  dataSharing: AnalysisSectionPayload
  disputeResolution: AnalysisSectionPayload
  limitations: string[]
  disclaimer: string
  generatedAt: string
  providerMetadata: { provider: string; model: string; generatedAt: string; inputHash: string; schemaVersion: string }
}

export type PublicUser = {
  id: string
  email: string
  createdAt: string
}

export type ApiErrorPayload = {
  code: string
  message: string
  details: string[]
}

export type ChatMessage = { role: 'user' | 'assistant'; text: string }

export type ChatResultPayload = {
  agreementId: string
  contentHash: string
  analysisVersion: string
  answer: string
  sourceText: string
  sourceReference: { sectionTitle: string; sourceIndex: string } | null
  confidence: 'high' | 'medium' | 'low'
  notFound: boolean
  disclaimer: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function isApiErrorPayload(value: unknown): value is ApiErrorPayload {
  return isRecord(value) && typeof value.code === 'string' && typeof value.message === 'string'
}

export function isAnalysisResultPayload(value: unknown): value is AnalysisResultPayload {
  return isRecord(value) && typeof value.agreementId === 'string' && Array.isArray(value.attentionItems)
}

export type WebAnalyzeResponse = { result: AnalysisResultPayload; agreementText: string }

export function isWebAnalyzeResponse(value: unknown): value is WebAnalyzeResponse {
  return isRecord(value) && isAnalysisResultPayload(value.result) && typeof value.agreementText === 'string'
}

export function isChatResultPayload(value: unknown): value is ChatResultPayload {
  return isRecord(value) && typeof value.agreementId === 'string' && typeof value.answer === 'string'
}
