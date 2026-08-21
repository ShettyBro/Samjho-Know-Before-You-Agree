import type { AgreementExtractionResult } from '../extractionTypes'
import type { AgreementIdentityResult } from '../identityTypes'
import { buildSamePageSourceDescriptor, canonicalizeUrl, computeAgreementId } from './agreementId'
import { computeContentHash, HASH_ALGORITHM, NORMALIZATION_VERSION } from './hash'

export type PageContext = { origin: string; url: string }

export async function computeIdentity(
  extraction: AgreementExtractionResult,
  pageContext: PageContext,
): Promise<AgreementIdentityResult> {
  const warnings: string[] = [...extraction.extractionWarnings]

  let canonicalSource: string
  const canonicalUrl = extraction.resolvedUrl ? canonicalizeUrl(extraction.resolvedUrl, 'ignore') : undefined

  if (canonicalUrl) {
    canonicalSource = canonicalUrl
  } else {
    if (extraction.resolvedUrl) warnings.push('resolved URL could not be canonicalized; used same-page-style source descriptor')
    canonicalSource = buildSamePageSourceDescriptor({
      pageOrigin: pageContext.origin,
      pageUrl: pageContext.url,
      containerDescriptor: extraction.sourceReference.containerDescriptor,
      headingPath: extraction.sourceReference.headingPath,
      title: extraction.title,
    })
  }

  const agreementId = await computeAgreementId(canonicalSource)
  const { hash, canonical } = await computeContentHash(extraction.normalizedText)
  if (extraction.normalizedText.length === 0) warnings.push('empty normalized text; content hash reflects empty content')

  return {
    agreementId,
    contentHash: hash,
    canonicalSource,
    sourceType: extraction.sourceType,
    candidateId: extraction.candidateId,
    normalizationVersion: NORMALIZATION_VERSION,
    hashAlgorithm: HASH_ALGORITHM,
    hashInputLength: canonical.length,
    identityWarnings: warnings,
    computedAt: Date.now(),
  }
}
