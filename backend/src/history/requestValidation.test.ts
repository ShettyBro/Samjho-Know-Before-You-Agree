import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import type { AnalysisResult } from '../analysis/types.js'
import { validateSaveAgreementRequest } from './requestValidation.js'

function fakeResult(overrides: Partial<AnalysisResult> = {}): AnalysisResult {
  return {
    agreementId: 'agr:a',
    contentHash: 'sha256:h1',
    analysisVersion: 'v1',
    summary: ['A summary point.'],
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
    providerMetadata: { provider: 'mock', model: 'mock-v1', generatedAt: '2024-01-01T00:00:00.000Z', inputHash: 'sha256:h1', schemaVersion: 'v1' },
    ...overrides,
  }
}

test('a well-formed save request passes validation', () => {
  const outcome = validateSaveAgreementRequest({
    agreementId: 'agr:a',
    contentHash: 'sha256:h1',
    analysisVersion: 'v1',
    title: 'Terms of Service',
    result: fakeResult(),
  })
  assert.equal(outcome.ok, true)
})

test('a save request missing required fields is rejected', () => {
  const outcome = validateSaveAgreementRequest({ title: 'Terms of Service' })
  assert.equal(outcome.ok, false)
  if (!outcome.ok) assert.equal(outcome.error.code, 'VALIDATION_ERROR')
})

test('a save request whose embedded result does not match its own declared identity is rejected', () => {
  const outcome = validateSaveAgreementRequest({
    agreementId: 'agr:a',
    contentHash: 'sha256:h1',
    analysisVersion: 'v1',
    title: 'Terms of Service',
    result: fakeResult({ agreementId: 'agr:different' }),
  })
  assert.equal(outcome.ok, false)
  if (!outcome.ok) assert.equal(outcome.error.code, 'ANALYSIS_SCHEMA_ERROR')
})

test('a non-object request body is rejected', () => {
  const outcome = validateSaveAgreementRequest(null)
  assert.equal(outcome.ok, false)
})
