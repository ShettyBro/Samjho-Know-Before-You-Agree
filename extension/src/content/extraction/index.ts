import { sendRequest } from '../../shared/rpc'
import type { AgreementExtractionResult } from '../../shared/extractionTypes'
import type { LiveCandidate } from '../discovery/types'
import { extractCandidate } from './extractor'

const resultsByCandidateId = new Map<string, AgreementExtractionResult>()
const inFlight = new Set<string>()

function shouldSkip(previous: AgreementExtractionResult | undefined): boolean {
  if (!previous) return false
  if (previous.extractionStatus === 'READY' || previous.extractionStatus === 'PARTIAL') return true
  return previous.sourceType === 'pdf' || previous.sourceType === 'newTabLink' || previous.sourceType === 'externalLink'
}

function reportExtractions(results: AgreementExtractionResult[]): void {
  if (results.length === 0) return
  sendRequest('content', { type: 'EXTRACTION_UPDATE', results }).then((response) => {
    console.log('[Samjho] extraction update sent', response)
  })
}

export async function handleDiscoveredCandidates(
  live: LiveCandidate[],
  onResults?: (results: AgreementExtractionResult[]) => void,
): Promise<void> {
  const currentIds = new Set(live.map((candidate) => candidate.candidateId))
  for (const id of Array.from(resultsByCandidateId.keys())) {
    if (!currentIds.has(id)) resultsByCandidateId.delete(id)
  }

  const toExtract = live.filter(
    (candidate) => !inFlight.has(candidate.candidateId) && !shouldSkip(resultsByCandidateId.get(candidate.candidateId)),
  )
  if (toExtract.length === 0) return

  for (const candidate of toExtract) inFlight.add(candidate.candidateId)
  const results = await Promise.all(toExtract.map((candidate) => extractCandidate(candidate)))
  for (const candidate of toExtract) inFlight.delete(candidate.candidateId)

  for (const result of results) resultsByCandidateId.set(result.candidateId, result)
  reportExtractions(results)
  onResults?.(results)
}
