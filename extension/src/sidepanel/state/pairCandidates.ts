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

const LINKED_DOCUMENT_BONUS = 100000

function selectionScore(extraction: AgreementExtractionResult): number {
  const isLinkedDocument = extraction.sourceType !== 'samePage' && extraction.sourceType !== 'modal' && extraction.sourceType !== 'accordion'
  return (isLinkedDocument ? LINKED_DOCUMENT_BONUS : 0) + extraction.normalizedText.length
}

export function pickCurrentAgreement(paired: PairedCandidate[]): AgreementContext | undefined {
  let best: PairedCandidate | undefined
  let bestScore = -Infinity

  for (const pair of paired) {
    if (!isHighConfidenceExtraction(pair.extraction)) continue
    const score = selectionScore(pair.extraction)
    if (score > bestScore) {
      bestScore = score
      best = pair
    }
  }

  if (!best) return undefined
  const { extraction, identity } = best
  return {
    agreementId: identity.agreementId,
    contentHash: identity.contentHash,
    analysisVersion: CURRENT_ANALYSIS_VERSION,
    title: extraction.title,
    sourceType: extraction.sourceType,
    sourceUrl: extraction.resolvedUrl ?? extraction.sourceUrl,
  }
}
