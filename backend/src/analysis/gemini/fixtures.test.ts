import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { analyzeAgreement } from '../service.js'
import { MAX_CONTENT_LENGTH } from '../limits.js'
import { validateAnalysisResult } from '../responseValidation.js'
import type { AnalysisRequest } from '../types.js'
import { createGeminiProvider } from './provider.js'
import {
  FULL_VALID_RESPONSE,
  MALFORMED_RESPONSE,
  MINIMAL_VALID_RESPONSE,
  MISSING_OPTIONAL_FIELDS_RESPONSE,
  MISSING_SOURCE_EVIDENCE_RESPONSE,
  MISSING_SOURCE_TEXT_RESPONSE,
  MIXED_LANGUAGE_RESPONSE,
  MIXED_LANGUAGE_SOURCE_TEXT,
  MULTI_CATEGORY_RESPONSE,
  MULTI_CATEGORY_SOURCE_TEXT,
  OVERSIZED_SOURCE_TEXT,
  UNSUPPORTED_CATEGORY_RESPONSE,
  UNSUPPORTED_IMPORTANCE_RESPONSE,
} from './fixtures.js'

function baseRequest(overrides: Partial<AnalysisRequest> = {}): AnalysisRequest {
  return {
    agreementId: 'agr:fixture',
    contentHash: 'sha256:fixture',
    sourceType: 'samePage',
    normalizedText:
      'Your subscription renews automatically each month.\nWe share data with analytics partners.\nYou may cancel at any time from account settings.',
    originalText:
      'Your subscription renews automatically each month.\nWe share data with analytics partners.\nYou may cancel at any time from account settings.',
    analysisVersion: 'v1',
    language: 'en',
    ...overrides,
  }
}

const context = { agreementId: 'agr:fixture', contentHash: 'sha256:fixture', analysisVersion: 'v1' }

test('fixture 1: a minimal valid Gemini response produces a canonical result that passes M06 validation', async () => {
  const provider = createGeminiProvider(async () => MINIMAL_VALID_RESPONSE)
  const raw = await provider.analyze(baseRequest())
  const result = validateAnalysisResult(raw, context)
  assert.equal(result.ok, true)
})

test('fixture 2: a full valid Gemini response with multiple attention items passes M06 validation', async () => {
  const provider = createGeminiProvider(async () => FULL_VALID_RESPONSE)
  const raw = await provider.analyze(baseRequest())
  const result = validateAnalysisResult(raw, context)
  assert.equal(result.ok, true)
  if (result.ok) assert.equal(result.value.attentionItems.length, 3)
})

test('fixture 3: every major category in one agreement is identified and passes validation', async () => {
  const request = baseRequest({ normalizedText: MULTI_CATEGORY_SOURCE_TEXT, originalText: MULTI_CATEGORY_SOURCE_TEXT })
  const provider = createGeminiProvider(async () => MULTI_CATEGORY_RESPONSE)
  const raw = await provider.analyze(request)
  const result = validateAnalysisResult(raw, context)
  assert.equal(result.ok, true)
  if (result.ok) {
    const categories = new Set(result.value.attentionItems.map((item) => item.category))
    assert.ok(categories.size >= 15)
    assert.ok(result.value.charges.available)
    assert.ok(result.value.renewals.available)
    assert.ok(result.value.cancellation.available)
    assert.ok(result.value.dataSharing.available)
    assert.ok(result.value.disputeResolution.available)
    assert.ok(result.value.obligations.available)
  }
})

test('fixture 4: missing optional fields (empty section title) still validate successfully', async () => {
  const provider = createGeminiProvider(async () => MISSING_OPTIONAL_FIELDS_RESPONSE)
  const raw = await provider.analyze(baseRequest())
  const result = validateAnalysisResult(raw, context)
  assert.equal(result.ok, true)
  if (result.ok) assert.equal(result.value.attentionItems.length, 1)
})

test('fixture 5: an unsupported category value fails M06 response validation rather than being silently accepted', async () => {
  const provider = createGeminiProvider(async () => UNSUPPORTED_CATEGORY_RESPONSE)
  const raw = (await provider.analyze(baseRequest())) as unknown as { attentionItems: unknown[] }
  assert.equal(raw.attentionItems.length, 1)
  const result = validateAnalysisResult(raw, context)
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, 'ANALYSIS_SCHEMA_ERROR')
})

test('fixture 6: an unsupported importance value fails M06 response validation', async () => {
  const provider = createGeminiProvider(async () => UNSUPPORTED_IMPORTANCE_RESPONSE)
  const raw = await provider.analyze(baseRequest())
  const result = validateAnalysisResult(raw, context)
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, 'ANALYSIS_SCHEMA_ERROR')
})

test('fixture 7: a finding with empty sourceText is dropped as ungrounded before it ever reaches validation', async () => {
  const provider = createGeminiProvider(async () => MISSING_SOURCE_TEXT_RESPONSE)
  const raw = await provider.analyze(baseRequest())
  const result = validateAnalysisResult(raw, context)
  assert.equal(result.ok, true)
  if (result.ok) assert.equal(result.value.attentionItems.length, 0)
})

test('fixture 8: a finding with no verifiable source evidence is dropped before validation', async () => {
  const provider = createGeminiProvider(async () => MISSING_SOURCE_EVIDENCE_RESPONSE)
  const raw = await provider.analyze(baseRequest())
  const result = validateAnalysisResult(raw, context)
  assert.equal(result.ok, true)
  if (result.ok) assert.equal(result.value.attentionItems.length, 0)
})

test('fixture 9: a malformed Gemini response never reaches the client as a successful analysis', async () => {
  const brokenProvider = createGeminiProvider(async () => MALFORMED_RESPONSE as never)
  const result = await analyzeAgreement(baseRequest(), brokenProvider)
  assert.equal(result.ok, false)
})

test('fixture 10: an oversized request is rejected by the M06 request validator before any provider call', async () => {
  const request = baseRequest({ normalizedText: OVERSIZED_SOURCE_TEXT, originalText: OVERSIZED_SOURCE_TEXT })
  assert.ok(request.normalizedText.length > MAX_CONTENT_LENGTH)
  const provider = createGeminiProvider(async () => MINIMAL_VALID_RESPONSE)
  const result = await analyzeAgreement(request, provider)
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, 'PAYLOAD_TOO_LARGE')
})

test('fixture 11: mixed English, Kannada, and Hindi source text is preserved and validates', async () => {
  const request = baseRequest({ normalizedText: MIXED_LANGUAGE_SOURCE_TEXT, originalText: MIXED_LANGUAGE_SOURCE_TEXT })
  const provider = createGeminiProvider(async () => MIXED_LANGUAGE_RESPONSE)
  const raw = await provider.analyze(request)
  const result = validateAnalysisResult(raw, context)
  assert.equal(result.ok, true)
  if (result.ok) {
    assert.equal(result.value.attentionItems.length, 1)
    assert.equal(result.value.attentionItems[0].sourceText, 'ನೀವು ಈ ನಿಯಮಗಳಿಗೆ ಒಪ್ಪುತ್ತೀರಿ.')
  }
})

test('fixture 12: multiple distinct clauses each derive into their correct analysis section', async () => {
  const request = baseRequest({ normalizedText: MULTI_CATEGORY_SOURCE_TEXT, originalText: MULTI_CATEGORY_SOURCE_TEXT })
  const provider = createGeminiProvider(async () => MULTI_CATEGORY_RESPONSE)
  const raw = (await provider.analyze(request)) as unknown as {
    renewals: { available: boolean }
    dataSharing: { available: boolean }
    cancellation: { available: boolean }
    charges: { available: boolean }
    disputeResolution: { available: boolean }
    obligations: { available: boolean }
  }
  assert.equal(raw.renewals.available, true)
  assert.equal(raw.dataSharing.available, true)
  assert.equal(raw.cancellation.available, true)
  assert.equal(raw.charges.available, true)
  assert.equal(raw.disputeResolution.available, true)
  assert.equal(raw.obligations.available, true)
})
