import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { buildAnalysisRequestPayload, isHighConfidenceExtraction } from './analysisRequestTypes'
import type { AgreementExtractionResult } from './extractionTypes'
import type { AgreementIdentityResult } from './identityTypes'

function extraction(overrides: Partial<AgreementExtractionResult> = {}): AgreementExtractionResult {
  return {
    candidateId: 'candidate-1',
    sourceType: 'sameOriginLink',
    title: 'Conditions of Use',
    originalText: 'You agree to these conditions.',
    normalizedText: 'you agree to these conditions.',
    sourceReference: { strategy: 'fetch:same-origin', headingPath: [], containerDescriptor: '' },
    confidence: 'high',
    extractionStatus: 'PARTIAL',
    extractionWarnings: [],
    extractedAt: Date.now(),
    ...overrides,
  }
}

function identity(overrides: Partial<AgreementIdentityResult> = {}): AgreementIdentityResult {
  return {
    agreementId: 'agr:candidate-1',
    contentHash: 'sha256:candidate-1',
    canonicalSource: 'https://www.amazon.in/gp/help/customer/display.html',
    sourceType: 'sameOriginLink',
    candidateId: 'candidate-1',
    normalizationVersion: 'v1',
    hashAlgorithm: 'sha256',
    hashInputLength: 30,
    identityWarnings: [],
    computedAt: Date.now(),
    ...overrides,
  }
}

test('a relative sourceUrl (a raw anchor href) is never sent to the backend as sourceUrl', () => {
  const request = buildAnalysisRequestPayload(
    extraction({
      sourceUrl: '/gp/help/customer/display.html/ref=ap_signin_notification_condition_of_use?nodeId=200545940',
      resolvedUrl: 'https://www.amazon.in/gp/help/customer/display.html/ref=ap_signin_notification_condition_of_use?nodeId=200545940',
    }),
    identity(),
  )

  assert.equal(request.sourceUrl, request.resolvedUrl)
  assert.ok(request.sourceUrl?.startsWith('https://'))
})

test('an already-absolute sourceUrl is preserved as-is', () => {
  const request = buildAnalysisRequestPayload(
    extraction({
      sourceUrl: 'https://example.com/terms',
      resolvedUrl: 'https://example.com/terms',
    }),
    identity(),
  )

  assert.equal(request.sourceUrl, 'https://example.com/terms')
})

test('a missing sourceUrl falls back to the resolved URL rather than sending undefined', () => {
  const request = buildAnalysisRequestPayload(
    extraction({ sourceUrl: undefined, resolvedUrl: 'https://example.com/terms' }),
    identity(),
  )

  assert.equal(request.sourceUrl, 'https://example.com/terms')
})

test('a high-confidence extraction with a length-truncated PARTIAL status is still treated as usable', () => {
  assert.equal(isHighConfidenceExtraction(extraction({ confidence: 'high', extractionStatus: 'PARTIAL' })), true)
})

test('a high-confidence extraction with READY status is treated as usable', () => {
  assert.equal(isHighConfidenceExtraction(extraction({ confidence: 'high', extractionStatus: 'READY' })), true)
})

test('an unresolved or failed extraction is never treated as usable, regardless of confidence', () => {
  assert.equal(isHighConfidenceExtraction(extraction({ confidence: 'high', extractionStatus: 'UNRESOLVED' })), false)
  assert.equal(isHighConfidenceExtraction(extraction({ confidence: 'high', extractionStatus: 'FAILED' })), false)
})
