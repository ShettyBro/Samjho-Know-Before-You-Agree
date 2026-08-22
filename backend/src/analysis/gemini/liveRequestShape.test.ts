import { strict as assert } from 'node:assert'
import { after, before, test } from 'node:test'
import { validateAnalysisResult } from '../responseValidation.js'
import type { AnalysisRequest } from '../types.js'

const originalFetch = globalThis.fetch
const originalApiKey = process.env.GEMINI_API_KEY
const originalModel = process.env.GEMINI_MODEL

let capturedRequestBody: unknown
let fetchCallCount = 0

const FAKE_MODEL_RESPONSE = {
  summary: ['This appears to be a subscription agreement.', '1 attention item was identified for review.'],
  attentionItems: [
    {
      category: 'autoRenewal',
      importance: 'high',
      title: 'Automatic renewal',
      explanation: 'The subscription renews automatically each month.',
      sourceText: 'Your subscription renews automatically each month.',
      sourceReference: { sectionTitle: 'Section 1', sourceIndex: '0' },
    },
  ],
}

before(() => {
  process.env.GEMINI_API_KEY = 'test-only-not-a-real-key'
  process.env.GEMINI_MODEL = 'gemini-test-model'

  globalThis.fetch = (async (input: unknown, init?: { body?: unknown }) => {
    fetchCallCount += 1
    if (typeof init?.body === 'string') {
      capturedRequestBody = JSON.parse(init.body)
    }
    return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(FAKE_MODEL_RESPONSE) }] } }] }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  }) as typeof fetch
})

after(() => {
  globalThis.fetch = originalFetch
  if (originalApiKey === undefined) delete process.env.GEMINI_API_KEY
  else process.env.GEMINI_API_KEY = originalApiKey
  if (originalModel === undefined) delete process.env.GEMINI_MODEL
  else process.env.GEMINI_MODEL = originalModel
})

test('the real client constructs a well-formed request and never reaches the network in this test', async () => {
  const { requestChunkAnalysis } = await import('./client.js')

  const result = await requestChunkAnalysis('Sample Test Service Terms. Your subscription renews automatically each month.', 'en')

  assert.equal(fetchCallCount, 1)
  assert.deepEqual(result, FAKE_MODEL_RESPONSE)
})

test('the captured request uses JSON structured output with the simplified content-only schema', async () => {
  const generationConfig = (capturedRequestBody as { generationConfig?: Record<string, unknown> })?.generationConfig
  assert.ok(generationConfig)
  assert.equal(generationConfig?.responseMimeType, 'application/json')

  const schema = generationConfig?.responseSchema as { properties?: Record<string, unknown> } | undefined
  assert.ok(schema)
  const propertyNames = Object.keys(schema?.properties ?? {}).sort()
  assert.deepEqual(propertyNames, ['attentionItems', 'summary'])
})

test('the full pipeline from request construction through M06 validation succeeds offline', async () => {
  const { createGeminiProvider } = await import('./provider.js')
  const { requestChunkAnalysis } = await import('./client.js')

  const provider = createGeminiProvider(requestChunkAnalysis)
  const request: AnalysisRequest = {
    agreementId: 'agr:offline',
    contentHash: 'sha256:offline',
    sourceType: 'samePage',
    normalizedText: 'Your subscription renews automatically each month.',
    originalText: 'Your subscription renews automatically each month.',
    analysisVersion: 'v1',
    language: 'en',
  }

  const raw = await provider.analyze(request)
  const result = validateAnalysisResult(raw, {
    agreementId: request.agreementId,
    contentHash: request.contentHash,
    analysisVersion: request.analysisVersion,
  })
  assert.equal(result.ok, true)
})
