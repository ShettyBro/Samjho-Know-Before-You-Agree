import type { AgreementExtractionResult } from '../../shared/extractionTypes'
import type { AgreementIdentityResult } from '../../shared/identityTypes'
import { CURRENT_ANALYSIS_VERSION, isHighConfidenceExtraction } from '../../shared/analysisRequestTypes'
import type { AgreementContext } from './types'

export type PairedCandidate = {
  extraction: AgreementExtractionResult
  identity: AgreementIdentityResult
}

export function pairExtractionsWithIdentities(
  extractions: AgreementExtractionResult[],
  identities: AgreementIdentityResult[],
): PairedCandidate[] {
  const identityByCandidateId = new Map(identities.map((identity) => [identity.candidateId, identity]))
  const paired: PairedCandidate[] = []

  for (const extraction of extractions) {
    const identity = identityByCandidateId.get(extraction.candidateId)
    if (identity) paired.push({ extraction, identity })
  }

  return paired
}

export function findPairByAgreementId(paired: PairedCandidate[], agreementId: string): PairedCandidate | undefined {
  return paired.find((pair) => pair.identity.agreementId === agreementId)
}

export function pickCurrentAgreement(paired: PairedCandidate[]): AgreementContext | undefined {
  for (let index = paired.length - 1; index >= 0; index -= 1) {
    const { extraction, identity } = paired[index]
    if (!isHighConfidenceExtraction(extraction)) continue
    return {
      agreementId: identity.agreementId,
      contentHash: identity.contentHash,
      analysisVersion: CURRENT_ANALYSIS_VERSION,
      title: extraction.title,
      sourceType: extraction.sourceType,
      sourceUrl: extraction.resolvedUrl ?? extraction.sourceUrl,
    }
  }
  return undefined
}
