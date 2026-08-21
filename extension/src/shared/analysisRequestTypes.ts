import type { AgreementSourceType } from './extractionTypes'

export type SupportedLanguage = 'en' | 'kn' | 'hi'

export const CURRENT_ANALYSIS_VERSION = 'v1'
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en'

export type AnalysisRequestPayload = {
  agreementId: string
  contentHash: string
  sourceType: AgreementSourceType
  sourceUrl?: string
  resolvedUrl?: string
  normalizedText: string
  originalText: string
  analysisVersion: string
  language: SupportedLanguage
}
