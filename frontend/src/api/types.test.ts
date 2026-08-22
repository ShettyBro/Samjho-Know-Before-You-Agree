import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { isAnalysisResultPayload, isApiErrorPayload, isChatResultPayload, isWebAnalyzeResponse } from './types.js'

function baseResult() {
  return {
    agreementId: 'agr:a',
    contentHash: 'sha256:a',
    analysisVersion: 'v1',
    summary: ['Summary point.'],
    attentionItems: [],
    obligations: { available: false, summary: [], relatedAttentionItemIds: [] },
    charges: { available: false, summary: [], relatedAttentionItemIds: [] },
    renewals: { available: false, summary: [], relatedAttentionItemIds: [] },
    cancellation: { available: false, summary: [], relatedAttentionItemIds: [] },
    dataSharing: { available: false, summary: [], relatedAttentionItemIds: [] },
    disputeResolution: { available: false, summary: [], relatedAttentionItemIds: [] },
    limitations: [],
    disclaimer: 'Not legal advice.',
    generatedAt: '2024-01-01T00:00:00.000Z',
    providerMetadata: { provider: 'mock', model: 'mock', generatedAt: '2024-01-01T00:00:00.000Z', inputHash: 'sha256:a', schemaVersion: 'v1' },
  }
}

test('isAnalysisResultPayload accepts a well-formed result', () => {
  assert.equal(isAnalysisResultPayload(baseResult()), true)
})

test('isAnalysisResultPayload rejects a malformed value', () => {
  assert.equal(isAnalysisResultPayload({ nonsense: true }), false)
  assert.equal(isAnalysisResultPayload(null), false)
  assert.equal(isAnalysisResultPayload('a string'), false)
})

test('isWebAnalyzeResponse accepts a result wrapped with agreementText', () => {
  assert.equal(isWebAnalyzeResponse({ result: baseResult(), agreementText: 'Sample text.' }), true)
})

test('isWebAnalyzeResponse rejects a bare result with no agreementText', () => {
  assert.equal(isWebAnalyzeResponse(baseResult()), false)
})

test('isApiErrorPayload accepts a well-formed error', () => {
  assert.equal(isApiErrorPayload({ code: 'VALIDATION_ERROR', message: 'Bad request', details: [] }), true)
})

test('isApiErrorPayload rejects a malformed value', () => {
  assert.equal(isApiErrorPayload({ message: 'missing code' }), false)
})

test('isChatResultPayload accepts a well-formed chat result', () => {
  assert.equal(
    isChatResultPayload({
      agreementId: 'agr:a',
      contentHash: 'sha256:a',
      analysisVersion: 'v1',
      answer: 'Yes.',
      sourceText: 'Source.',
      sourceReference: null,
      confidence: 'high',
      notFound: false,
      disclaimer: 'Not legal advice.',
    }),
    true,
  )
})

test('isChatResultPayload rejects a malformed value', () => {
  assert.equal(isChatResultPayload({ agreementId: 'agr:a' }), false)
})
