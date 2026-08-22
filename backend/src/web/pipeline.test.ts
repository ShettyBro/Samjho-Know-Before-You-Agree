import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import type { AgreementAnalysisProvider } from '../analysis/provider.js'
import type { AnalysisRequest } from '../analysis/types.js'
import { InMemoryAnalysisCache } from '../cache/AnalysisCache.js'
import { createCachedAnalysisService } from '../cache/cachedAnalysisService.js'
import { analyzeWebSubmission } from './pipeline.js'

function emptySection() {
  return { available: false, summary: [], relatedAttentionItemIds: [] }
}

function createFakeProvider() {
  let callCount = 0
  const provider: AgreementAnalysisProvider = {
    name: 'fake',
    async analyze(request: AnalysisRequest) {
      callCount += 1
      return {
        agreementId: request.agreementId,
        contentHash: request.contentHash,
        analysisVersion: request.analysisVersion,
        summary: ['Fake summary point.'],
        attentionItems: [],
        obligations: emptySection(),
        charges: emptySection(),
        renewals: emptySection(),
        cancellation: emptySection(),
        dataSharing: emptySection(),
        disputeResolution: emptySection(),
        limitations: [],
        disclaimer: 'Not legal advice.',
        generatedAt: '2024-01-01T00:00:00.000Z',
        providerMetadata: {
          provider: 'fake',
          model: 'fake-model',
          generatedAt: '2024-01-01T00:00:00.000Z',
          inputHash: request.contentHash,
          schemaVersion: 'v1',
        },
      }
    },
  }
  return { provider, callCount: () => callCount }
}

test('pasted text produces a valid analysis result through the shared M08 cache service', async () => {
  const { provider } = createFakeProvider()
  const service = createCachedAnalysisService({ cache: new InMemoryAnalysisCache(50), provider, ttlMs: 60000 })

  const result = await analyzeWebSubmission({ text: 'Your subscription renews automatically each month.', sourceType: 'pastedText', language: 'en' }, service)
  assert.equal(result.ok, true)
  if (result.ok) assert.equal(result.value.result.summary[0], 'Fake summary point.')
})

test('submitting the same pasted text twice reuses the cache and does not call the provider again', async () => {
  const { provider, callCount } = createFakeProvider()
  const service = createCachedAnalysisService({ cache: new InMemoryAnalysisCache(50), provider, ttlMs: 60000 })

  await analyzeWebSubmission({ text: 'Your subscription renews automatically each month.', sourceType: 'pastedText', language: 'en' }, service)
  await analyzeWebSubmission({ text: 'Your subscription renews automatically each month.', sourceType: 'pastedText', language: 'en' }, service)

  assert.equal(callCount(), 1)
})

test('submitting different pasted text triggers a fresh analysis', async () => {
  const { callCount } = createFakeProvider()
  const { provider: freshProvider, callCount: freshCallCount } = createFakeProvider()
  const service = createCachedAnalysisService({ cache: new InMemoryAnalysisCache(50), provider: freshProvider, ttlMs: 60000 })

  await analyzeWebSubmission({ text: 'First agreement text.', sourceType: 'pastedText', language: 'en' }, service)
  await analyzeWebSubmission({ text: 'Second, entirely different agreement text.', sourceType: 'pastedText', language: 'en' }, service)

  assert.equal(freshCallCount(), 2)
  void callCount
})

test('empty pasted text is rejected before reaching the analysis service', async () => {
  const { provider, callCount } = createFakeProvider()
  const service = createCachedAnalysisService({ cache: new InMemoryAnalysisCache(50), provider, ttlMs: 60000 })

  const result = await analyzeWebSubmission({ text: '   ', sourceType: 'pastedText', language: 'en' }, service)
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, 'VALIDATION_ERROR')
  assert.equal(callCount(), 0)
})

test('oversized pasted text is rejected with a PAYLOAD_TOO_LARGE error', async () => {
  const { provider, callCount } = createFakeProvider()
  const service = createCachedAnalysisService({ cache: new InMemoryAnalysisCache(50), provider, ttlMs: 60000 })

  const oversizedText = 'a'.repeat(60000)
  const result = await analyzeWebSubmission({ text: oversizedText, sourceType: 'pastedText', language: 'en' }, service)
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, 'PAYLOAD_TOO_LARGE')
  assert.equal(callCount(), 0)
})

test('an unsupported language is rejected before reaching the analysis service', async () => {
  const { provider, callCount } = createFakeProvider()
  const service = createCachedAnalysisService({ cache: new InMemoryAnalysisCache(50), provider, ttlMs: 60000 })

  const result = await analyzeWebSubmission({ text: 'Some agreement text.', sourceType: 'pastedText', language: 'fr' }, service)
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, 'UNSUPPORTED_LANGUAGE')
  assert.equal(callCount(), 0)
})

test('PDF-sourced text and pasted-text with identical content produce different agreement identities', async () => {
  const { provider } = createFakeProvider()
  const service = createCachedAnalysisService({ cache: new InMemoryAnalysisCache(50), provider, ttlMs: 60000 })

  const pastedResult = await analyzeWebSubmission({ text: 'Shared agreement content.', sourceType: 'pastedText', language: 'en' }, service)
  const pdfResult = await analyzeWebSubmission({ text: 'Shared agreement content.', sourceType: 'pdf', language: 'en' }, service)

  assert.equal(pastedResult.ok, true)
  assert.equal(pdfResult.ok, true)
  if (pastedResult.ok && pdfResult.ok) {
    assert.notEqual(pastedResult.value.result.agreementId, pdfResult.value.result.agreementId)
  }
})

test('a language switch alone does not change the underlying agreement identity', async () => {
  const { provider } = createFakeProvider()
  const service = createCachedAnalysisService({ cache: new InMemoryAnalysisCache(50), provider, ttlMs: 60000 })

  const englishResult = await analyzeWebSubmission({ text: 'Shared agreement content for language test.', sourceType: 'pastedText', language: 'en' }, service)
  const kannadaResult = await analyzeWebSubmission({ text: 'Shared agreement content for language test.', sourceType: 'pastedText', language: 'kn' }, service)

  assert.equal(englishResult.ok, true)
  assert.equal(kannadaResult.ok, true)
  if (englishResult.ok && kannadaResult.ok) {
    assert.equal(englishResult.value.result.agreementId, kannadaResult.value.result.agreementId)
  }
})
