import type { AgreementSourceType } from './extractionTypes'

export type AttentionCategory =
  | 'recurringCharges'
  | 'autoRenewal'
  | 'fees'
  | 'dataCollection'
  | 'dataSharing'
  | 'thirdParties'
  | 'refundRestrictions'
  | 'cancellation'
  | 'disputeResolution'
  | 'accountTermination'
  | 'obligations'
  | 'authorizationConsent'
  | 'arbitration'
  | 'liability'
  | 'indemnification'
  | 'governingLaw'
  | 'deadline'
  | 'other'

export type ImportanceLevel = 'high' | 'medium' | 'low'

export type SourceReferencePayload = {
  headingPath: string[]
  containerDescriptor: string
  sourceIndex: number
  sourceUrl?: string
  sourceType: AgreementSourceType
}

export type AttentionItemPayload = {
  id: string
  category: AttentionCategory
  importance: ImportanceLevel
  title: string
  explanation: string
  sourceReference: SourceReferencePayload
  sourceText: string
  confidence: ImportanceLevel
}

export type AnalysisSectionPayload = {
  available: boolean
  summary: string[]
  relatedAttentionItemIds: string[]
}

export type ProviderMetadataPayload = {
  provider: string
  model: string
  generatedAt: string
  inputHash: string
  schemaVersion: string
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
  providerMetadata: ProviderMetadataPayload
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string')
}

function isSection(value: unknown): value is AnalysisSectionPayload {
  return (
    isRecord(value) &&
    typeof value.available === 'boolean' &&
    isStringArray(value.summary) &&
    isStringArray(value.relatedAttentionItemIds)
  )
}

function isAttentionItem(value: unknown): value is AttentionItemPayload {
  if (!isRecord(value)) return false
  if (typeof value.id !== 'string' || value.id.length === 0) return false
  if (typeof value.category !== 'string') return false
  if (typeof value.importance !== 'string') return false
  if (typeof value.confidence !== 'string') return false
  if (typeof value.title !== 'string') return false
  if (typeof value.explanation !== 'string') return false
  if (typeof value.sourceText !== 'string') return false
  if (!isRecord(value.sourceReference)) return false
  return true
}

export function isAnalysisResultPayload(value: unknown): value is AnalysisResultPayload {
  if (!isRecord(value)) return false
  if (typeof value.agreementId !== 'string' || value.agreementId.length === 0) return false
  if (typeof value.contentHash !== 'string' || value.contentHash.length === 0) return false
  if (typeof value.analysisVersion !== 'string' || value.analysisVersion.length === 0) return false
  if (!isStringArray(value.summary)) return false
  if (!Array.isArray(value.attentionItems) || !value.attentionItems.every(isAttentionItem)) return false
  if (!isSection(value.obligations)) return false
  if (!isSection(value.charges)) return false
  if (!isSection(value.renewals)) return false
  if (!isSection(value.cancellation)) return false
  if (!isSection(value.dataSharing)) return false
  if (!isSection(value.disputeResolution)) return false
  if (!isStringArray(value.limitations)) return false
  if (typeof value.disclaimer !== 'string') return false
  if (typeof value.generatedAt !== 'string') return false
  if (!isRecord(value.providerMetadata)) return false
  return true
}
