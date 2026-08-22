import { strict as assert } from 'node:assert'
import { after, test } from 'node:test'
import type { ChatRequest, ChatResult } from './chatTypes'

const originalFetch = globalThis.fetch

after(() => {
  globalThis.fetch = originalFetch
})

function chatRequest(overrides: Partial<ChatRequest> = {}): ChatRequest {
  return {
    agreementId: 'agr:a',
    contentHash: 'sha256:a',
    analysisVersion: 'v1',
    question: 'Will this renew automatically?',
    language: 'en',
    agreementText: 'Your subscription renews automatically each month.',
    history: [],
    ...overrides,
  }
}

function chatResult(overrides: Partial<ChatResult> = {}): ChatResult {
  return {
    agreementId: 'agr:a',
    contentHash: 'sha256:a',
    analysisVersion: 'v1',
    answer: 'Yes, it renews automatically each month.',
    sourceText: 'Your subscription renews automatically each month.',
    sourceReference: { sectionTitle: '', sourceIndex: '0' },
    confidence: 'high',
    notFound: false,
    disclaimer: 'Not legal advice.',
    ...overrides,
  }
}

test('chatWithAgreement returns the parsed result on a successful backend response', async () => {
  const expected = chatResult()
  globalThis.fetch = (async () =>
    new Response(JSON.stringify(expected), { status: 200, headers: { 'Content-Type': 'application/json' } })) as typeof fetch

  const { chatWithAgreement } = await import('./backendClient.js')
  const outcome = await chatWithAgreement(chatRequest())

  assert.equal(outcome.ok, true)
  if (outcome.ok) assert.deepEqual(outcome.result, expected)
})

test('chatWithAgreement returns a safe failure message on a non-OK backend response', async () => {
  globalThis.fetch = (async () =>
    new Response(JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'raw internal detail' } }), { status: 400 })) as typeof fetch

  const { chatWithAgreement } = await import('./backendClient.js')
  const outcome = await chatWithAgreement(chatRequest())

  assert.equal(outcome.ok, false)
  if (!outcome.ok) assert.ok(!outcome.message.includes('raw internal detail'))
})

test('chatWithAgreement returns a safe failure message when the network call throws', async () => {
  globalThis.fetch = (async () => {
    throw new Error('network unavailable')
  }) as typeof fetch

  const { chatWithAgreement } = await import('./backendClient.js')
  const outcome = await chatWithAgreement(chatRequest())

  assert.equal(outcome.ok, false)
  if (!outcome.ok) assert.ok(!outcome.message.includes('network unavailable'))
})

test('chatWithAgreement rejects a malformed response body rather than surfacing partial data', async () => {
  globalThis.fetch = (async () =>
    new Response(JSON.stringify({ nonsense: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })) as typeof fetch

  const { chatWithAgreement } = await import('./backendClient.js')
  const outcome = await chatWithAgreement(chatRequest())

  assert.equal(outcome.ok, false)
})
