import type { AgreementSourceType } from './extractionTypes'

export type AgreementIdentityResult = {
  agreementId: string
  contentHash: string
  canonicalSource: string
  sourceType: AgreementSourceType
  candidateId: string
  normalizationVersion: string
  hashAlgorithm: string
  hashInputLength: number
  identityWarnings: string[]
  computedAt: number
}
