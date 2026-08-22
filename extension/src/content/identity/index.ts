import { sendRequest } from '../../shared/rpc'
import { computeIdentity } from '../../shared/identity/computeIdentity'
import type { AgreementExtractionResult } from '../../shared/extractionTypes'
import { buildAnalysisRequestPayload, isHighConfidenceExtraction, type AnalysisRequestPayload } from '../../shared/analysisRequestTypes'

export async function handleExtractionResults(results: AgreementExtractionResult[]): Promise<void> {
  if (results.length === 0) return

  const pageContext = { origin: window.location.origin, url: window.location.href }
  const identities = await Promise.all(results.map((result) => computeIdentity(result, pageContext)))

  sendRequest('content', { type: 'IDENTITY_UPDATE', identities }).then((response) => {
    console.log('[Samjho] identity update sent', response)
  })

  const prefetchRequests: AnalysisRequestPayload[] = results
    .map((extraction, index) => ({ extraction, identity: identities[index] }))
    .filter(({ extraction }) => isHighConfidenceExtraction(extraction))
    .map(({ extraction, identity }) => buildAnalysisRequestPayload(extraction, identity))

  if (prefetchRequests.length === 0) return

  sendRequest('content', { type: 'PREFETCH_REQUEST', requests: prefetchRequests }).then((response) => {
    console.log('[Samjho] prefetch request sent', response)
  })
}
