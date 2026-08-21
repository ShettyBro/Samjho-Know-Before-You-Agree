import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { mockProvider } from './mockProvider.js'
import { validateAnalysisResult } from './responseValidation.js'
import type { AnalysisRequest } from './types.js'

const request: AnalysisRequest = {
  agreementId: 'agr:abc123',
  contentHash: 'sha256:deadbeef',
  sourceType: 'sameOriginLink',
  sourceUrl: 'https://example.com/terms',
  resolvedUrl: 'https://example.com/terms',
  normalizedText: 'You agree that your membership automatically renews each month.\nYou may cancel at any time.',
  originalText: 'You agree that your membership automatically renews each month.\nYou may cancel at any time.',
  analysisVersion: 'v1',
  language: 'en',
}

const context = { agreementId: request.agreementId, contentHash: request.contentHash, analysisVersion: request.analysisVersion }

function validAttentionItem(overrides: Record<string, unknown> = {}) {
  return {
    id: 'item-1',
    category: 'autoRenewal',
    importance: 'high',
    confidence: 'medium',
    title: 'Automatic renewal detected',
    explanation: 'Your subscription renews automatically unless cancelled.',
    sourceText: 'Your membership automatically renews each month.',
    sourceReference: {
      headingPath: [],
      containerDescriptor: 'sameOriginLink',
      sourceIndex: 0,
      sourceUrl: 'https://example.com/terms',
      sourceType: 'sameOriginLink',
    },
    ...overrides,
  }
}

function validSection(overrides: Record<string, unknown> = {}) {
  return { available: false, summary: [], relatedAttentionItemIds: [], ...overrides }
}

function validResult(overrides: Record<string, unknown> = {}) {
  return {
    agreementId: request.agreementId,
    contentHash: request.contentHash,
    analysisVersion: request.analysisVersion,
    summary: ['This is a summary point.'],
    attentionItems: [validAttentionItem()],
    obligations: validSection(),
    charges: validSection(),
    renewals: validSection({ available: true, summary: ['renews monthly'], relatedAttentionItemIds: ['item-1'] }),
    cancellation: validSection(),
    dataSharing: validSection(),
    disputeResolution: validSection(),
    limitations: ['This is a mock analysis.'],
    disclaimer: 'Samjho is not legal advice.',
    generatedAt: '2024-01-01T00:00:00.000Z',
    providerMetadata: {
      provider: 'mock',
      model: 'samjho-mock-v1',
      generatedAt: '2024-01-01T00:00:00.000Z',
      inputHash: request.contentHash,
      schemaVersion: 'v1',
    },
    ...overrides,
  }
}

test('valid mock-provider output passes response schema validation', async () => {
  const raw = await mockProvider.analyze(request)
  const result = validateAnalysisResult(raw, context)
  assert.equal(result.ok, true)
})

test('a missing required output field produces ANALYSIS_SCHEMA_ERROR', () => {
  const output = validResult()
  delete (output as Record<string, unknown>).disclaimer
  const result = validateAnalysisResult(output, context)
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, 'ANALYSIS_SCHEMA_ERROR')
})

test('an invalid attention item produces ANALYSIS_SCHEMA_ERROR', () => {
  const output = validResult({ attentionItems: [validAttentionItem({ title: '' })] })
  const result = validateAnalysisResult(output, context)
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, 'ANALYSIS_SCHEMA_ERROR')
})

test('an invalid category is rejected rather than silently coerced to other', () => {
  const output = validResult({ attentionItems: [validAttentionItem({ category: 'bogusCategory' })] })
  const result = validateAnalysisResult(output, context)
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, 'ANALYSIS_SCHEMA_ERROR')
})

test('the "other" category is explicitly allowed', () => {
  const output = validResult({ attentionItems: [validAttentionItem({ category: 'other' })] })
  const result = validateAnalysisResult(output, context)
  assert.equal(result.ok, true)
})

test('a source-linked attention item requires sourceText and a valid sourceReference', () => {
  const withoutSourceText = validResult({ attentionItems: [validAttentionItem({ sourceText: '' })] })
  const result = validateAnalysisResult(withoutSourceText, context)
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, 'ANALYSIS_SCHEMA_ERROR')

  const valid = validateAnalysisResult(validResult(), context)
  assert.equal(valid.ok, true)
  if (valid.ok) {
    assert.ok(valid.value.attentionItems[0].sourceText.length > 0)
    assert.ok(valid.value.attentionItems[0].sourceReference.sourceType)
  }
})

test('a malformed provider response never validates as successful', () => {
  const result = validateAnalysisResult('not even an object', context)
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, 'ANALYSIS_SCHEMA_ERROR')
})

test('HTML/script content in a user-visible field is rejected, never passed through as valid', () => {
  const output = validResult({ summary: ['<script>alert(1)</script>'] })
  const result = validateAnalysisResult(output, context)
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, 'ANALYSIS_SCHEMA_ERROR')
})

test('analysisVersion is always present and must match the request', () => {
  const mismatched = validResult({ analysisVersion: 'v2' })
  const result = validateAnalysisResult(mismatched, context)
  assert.equal(result.ok, false)

  const matching = validateAnalysisResult(validResult(), context)
  assert.equal(matching.ok, true)
  if (matching.ok) assert.equal(matching.value.analysisVersion, 'v1')
})
