import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import type { AgreementExtractionResult } from '../extractionTypes'
import { computeIdentity } from './computeIdentity'

const pageContext = { origin: 'https://example.com', url: 'https://example.com/checkout' }

function baseExtraction(overrides: Partial<AgreementExtractionResult>): AgreementExtractionResult {
  return {
    candidateId: 'candidate-a',
    sourceType: 'sameOriginLink',
    title: 'Terms of Service',
    resolvedUrl: 'https://example.com/terms',
    originalText: 'Your subscription renews monthly.',
    normalizedText: 'Your subscription renews monthly.',
    sourceReference: { strategy: 'fetch:same-origin', headingPath: [], containerDescriptor: 'main' },
    confidence: 'high',
    extractionStatus: 'READY',
    extractionWarnings: [],
    extractedAt: Date.now(),
    ...overrides,
  }
}

test('candidate id does not affect the content hash', async () => {
  const a = await computeIdentity(baseExtraction({ candidateId: 'candidate-a' }), pageContext)
  const b = await computeIdentity(baseExtraction({ candidateId: 'candidate-b' }), pageContext)
  assert.equal(a.contentHash, b.contentHash)
  assert.notEqual(a.candidateId, b.candidateId)
})

test('same canonical URL with changed content keeps the same agreement id but changes the content hash', async () => {
  const before = await computeIdentity(
    baseExtraction({ normalizedText: 'Your subscription renews monthly.' }),
    pageContext,
  )
  const after = await computeIdentity(
    baseExtraction({ normalizedText: 'Your subscription renews annually.' }),
    pageContext,
  )
  assert.equal(before.agreementId, after.agreementId)
  assert.notEqual(before.contentHash, after.contentHash)
})

test('different resolved URLs produce different agreement ids', async () => {
  const terms = await computeIdentity(baseExtraction({ resolvedUrl: 'https://example.com/terms' }), pageContext)
  const privacy = await computeIdentity(baseExtraction({ resolvedUrl: 'https://example.com/privacy' }), pageContext)
  assert.notEqual(terms.agreementId, privacy.agreementId)
})

test('agreement id and content hash are never the same field value', async () => {
  const result = await computeIdentity(baseExtraction({}), pageContext)
  assert.notEqual(result.agreementId, result.contentHash)
  assert.match(result.agreementId, /^agr:/)
  assert.match(result.contentHash, /^sha256:/)
})

test('same-page agreement without a URL derives a reproducible descriptor-based identity', async () => {
  const extraction = baseExtraction({
    resolvedUrl: undefined,
    sourceType: 'samePage',
    sourceReference: { strategy: 'section', headingPath: ['Legal'], containerDescriptor: 'article#terms-section' },
  })
  const a = await computeIdentity(extraction, pageContext)
  const b = await computeIdentity(extraction, pageContext)
  assert.equal(a.agreementId, b.agreementId)
})

test('normalization version and hash algorithm are always present', async () => {
  const result = await computeIdentity(baseExtraction({}), pageContext)
  assert.equal(result.normalizationVersion, 'v1')
  assert.equal(result.hashAlgorithm, 'SHA-256')
  assert.ok(result.hashInputLength > 0)
})
