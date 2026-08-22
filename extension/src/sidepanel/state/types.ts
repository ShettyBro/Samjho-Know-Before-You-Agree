import type { AgreementSourceType } from '../../shared/extractionTypes'
import type { AnalysisResultPayload } from '../../shared/analysisResultTypes'

export type AgreementContext = {
  agreementId: string
  contentHash: string
  analysisVersion: string
  title: string
  sourceType: AgreementSourceType
  sourceUrl?: string
}

export type PanelState =
  | { kind: 'IDLE' }
  | { kind: 'DETECTING' }
  | { kind: 'NO_AGREEMENT' }
  | { kind: 'UNSUPPORTED' }
  | { kind: 'PREPARING'; agreement: AgreementContext; attempt: number }
  | { kind: 'PREFETCHING'; agreement: AgreementContext; attempt: number }
  | { kind: 'READY'; agreement: AgreementContext; result: AnalysisResultPayload }
  | { kind: 'ERROR'; agreement: AgreementContext; message: string; attempt: number }

export type PanelAction =
  | { type: 'TAB_CHANGED' }
  | { type: 'DETECTION_TIMED_OUT'; hasContentScript: boolean }
  | { type: 'AGREEMENT_FOUND'; agreement: AgreementContext }
  | { type: 'CACHED_RESULT_FOUND'; agreement: AgreementContext; result: AnalysisResultPayload }
  | { type: 'ANALYSIS_STARTED'; agreement: AgreementContext; attempt: number }
  | { type: 'ANALYSIS_SUCCEEDED'; agreement: AgreementContext; attempt: number; result: AnalysisResultPayload }
  | { type: 'ANALYSIS_FAILED'; agreement: AgreementContext; attempt: number; message: string }
  | { type: 'RETRY_REQUESTED' }
  | { type: 'LANGUAGE_CHANGED' }

export function isSameAgreement(a: AgreementContext, b: AgreementContext): boolean {
  return a.agreementId === b.agreementId && a.contentHash === b.contentHash && a.analysisVersion === b.analysisVersion
}

export function resultCacheKey(agreement: AgreementContext, language: string): string {
  return `${agreement.agreementId}:${agreement.contentHash}:${agreement.analysisVersion}:${language}`
}
