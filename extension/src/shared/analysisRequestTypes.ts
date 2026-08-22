import type { AgreementExtractionResult, AgreementSourceType } from './extractionTypes'
import type { AgreementIdentityResult } from './identityTypes'

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

export function isHighConfidenceExtraction(extraction: AgreementExtractionResult): boolean {
  return (
    extraction.confidence === 'high' &&
    (extraction.extractionStatus === 'READY' || extraction.extractionStatus === 'PARTIAL')
  )
}

function toAbsoluteHttpUrl(value: string | undefined): string | undefined {
  if (!value) return undefined
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:' ? value : undefined
  } catch {
    return undefined
  }
}

export function buildAnalysisRequestPayload(
  extraction: AgreementExtractionResult,
  identity: AgreementIdentityResult,
  language: SupportedLanguage = DEFAULT_LANGUAGE,
): AnalysisRequestPayload {
  return {
    agreementId: identity.agreementId,
    contentHash: identity.contentHash,
    sourceType: extraction.sourceType,
    sourceUrl: toAbsoluteHttpUrl(extraction.sourceUrl) ?? toAbsoluteHttpUrl(extraction.resolvedUrl),
    resolvedUrl: extraction.resolvedUrl,
    normalizedText: extraction.normalizedText,
    originalText: extraction.originalText,
    analysisVersion: CURRENT_ANALYSIS_VERSION,
    language,
  }
}
