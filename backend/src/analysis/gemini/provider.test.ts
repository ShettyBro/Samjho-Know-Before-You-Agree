import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { analyzeAgreement } from '../service.js'
import { validateAnalysisResult } from '../responseValidation.js'
import type { AnalysisRequest } from '../types.js'
import { createGeminiProvider } from './provider.js'
import type { GeminiContentPayload } from './types.js'

function baseRequest(overrides: Partial<AnalysisRequest> = {}): AnalysisRequest {
  return {
    agreementId: 'agr:abc123',
    contentHash: 'sha256:deadbeef',
    sourceType: 'sameOriginLink',
    sourceUrl: 'https://example.com/terms',
    resolvedUrl: 'https://example.com/terms',
    normalizedText: 'Your subscription renews automatically each month.\nYou may cancel at any time from account settings.',
    originalText: 'Your subscription renews automatically each month.\nYou may cancel at any time from account settings.',
    analysisVersion: 'v1',
    language: 'en',
    ...overrides,
  }
}

function payloadWithItems(items: GeminiContentPayload['attentionItems']): GeminiContentPayload {
  return {
    summary: ['This agreement includes an auto-renewal clause.'],
    attentionItems: items,
    limitations: [],
  }
}

const context = { agreementId: 'agr:abc123', contentHash: 'sha256:deadbeef', analysisVersion: 'v1' }

test('a provider can be created from any chunk analyzer function', () => {
  const provider = createGeminiProvider(async () => payloadWithItems([]))
  assert.equal(provider.name, 'gemini')
  assert.equal(typeof provider.analyze, 'function')
})

test('a structured, well-formed Gemini response passes M06 response validation', async () => {
  const request = baseRequest()
  const provider = createGeminiProvider(async () =>
    payloadWithItems([
      {
        id: 'a',
        category: 'autoRenewal',
        importance: 'high',
        confidence: 'high',
        title: 'Automatic renewal',
        explanation: 'The subscription renews automatically each month.',
        sourceText: 'Your subscription renews automatically each month.',
        sourceReference: { headingPath: [], containerDescriptor: 'paragraph', sourceIndex: 0 },
      },
    ]),
  )
  const raw = await provider.analyze(request)
  const result = validateAnalysisResult(raw, context)
  assert.equal(result.ok, true)
})

test('the six analysis sections are derived from attention items rather than requested from the model', async () => {
  const request = baseRequest()
  const provider = createGeminiProvider(async () =>
    payloadWithItems([
      {
        id: 'a',
        category: 'autoRenewal',
        importance: 'high',
        confidence: 'high',
        title: 'Automatic renewal',
        explanation: 'The subscription renews automatically each month.',
        sourceText: 'Your subscription renews automatically each month.',
        sourceReference: { headingPath: [], containerDescriptor: 'paragraph', sourceIndex: 0 },
      },
    ]),
  )
  const raw = (await provider.analyze(request)) as unknown as {
    renewals: { available: boolean; relatedAttentionItemIds: string[] }
    charges: { available: boolean }
  }
  assert.equal(raw.renewals.available, true)
  assert.equal(raw.renewals.relatedAttentionItemIds.length, 1)
  assert.equal(raw.charges.available, false)
})

test('a malformed provider response never reaches the client as a successful analysis', async () => {
  const brokenProvider = createGeminiProvider(async () => ({ nonsense: true }) as unknown as GeminiContentPayload)
  const result = await analyzeAgreement(baseRequest(), brokenProvider)
  assert.equal(result.ok, false)
  if (!result.ok) {
    assert.ok(['ANALYSIS_SCHEMA_ERROR', 'PROVIDER_ERROR', 'INTERNAL_ERROR'].includes(result.error.code))
  }
})

test('a fabricated finding not grounded in the source text is dropped and disclosed as a limitation', async () => {
  const request = baseRequest()
  const provider = createGeminiProvider(async () =>
    payloadWithItems([
      {
        id: 'real',
        category: 'cancellation',
        importance: 'medium',
        confidence: 'medium',
        title: 'Cancellation',
        explanation: 'You can cancel from account settings.',
        sourceText: 'You may cancel at any time from account settings.',
        sourceReference: { headingPath: [], containerDescriptor: 'paragraph', sourceIndex: 1 },
      },
      {
        id: 'fabricated',
        category: 'fees',
        importance: 'high',
        confidence: 'high',
        title: 'Cancellation fee',
        explanation: 'A $500 penalty applies.',
        sourceText: 'A five hundred dollar cancellation penalty applies immediately.',
        sourceReference: { headingPath: [], containerDescriptor: 'paragraph', sourceIndex: 1 },
      },
    ]),
  )
  const raw = (await provider.analyze(request)) as GeminiContentPayload
  assert.equal(raw.attentionItems.length, 1)
  assert.equal(raw.attentionItems[0].title, 'Cancellation')
  assert.ok(raw.limitations.some((entry) => entry.includes('could not be verified')))
})

test('a long document is chunked and the analyzer is invoked more than once without unbounded growth', async () => {
  const paragraph = 'Clause text describing obligations. '.repeat(400)
  const longText = Array.from({ length: 6 }, () => paragraph).join('\n\n')
  let callCount = 0
  const provider = createGeminiProvider(async (chunkText) => {
    callCount += 1
    return payloadWithItems([
      {
        id: `item-${callCount}`,
        category: 'obligations',
        importance: 'low',
        confidence: 'low',
        title: 'Obligation',
        explanation: 'General obligation clause.',
        sourceText: chunkText.slice(0, 30),
        sourceReference: { headingPath: [], containerDescriptor: 'paragraph', sourceIndex: 0 },
      },
    ])
  })
  const raw = (await provider.analyze(baseRequest({ normalizedText: longText, originalText: longText }))) as GeminiContentPayload
  assert.ok(callCount > 1)
  assert.ok(raw.attentionItems.length <= 40)
})

test('multiple distinct clauses in one agreement are each identified as separate attention items', async () => {
  const request = baseRequest({
    normalizedText:
      'A recurring monthly fee applies.\n\nThe subscription renews automatically unless cancelled.\n\nData is shared with third-party partners.\n\nCancellation requires 30 days notice.',
  })
  const provider = createGeminiProvider(async (chunkText) =>
    payloadWithItems([
      {
        id: 'charge',
        category: 'recurringCharges',
        importance: 'high',
        confidence: 'high',
        title: 'Recurring charge',
        explanation: 'A recurring fee applies.',
        sourceText: 'A recurring monthly fee applies.',
        sourceReference: { headingPath: [], containerDescriptor: 'paragraph', sourceIndex: 0 },
      },
      {
        id: 'renewal',
        category: 'autoRenewal',
        importance: 'high',
        confidence: 'high',
        title: 'Auto-renewal',
        explanation: 'Renews automatically.',
        sourceText: 'The subscription renews automatically unless cancelled.',
        sourceReference: { headingPath: [], containerDescriptor: 'paragraph', sourceIndex: 1 },
      },
      {
        id: 'sharing',
        category: 'dataSharing',
        importance: 'medium',
        confidence: 'medium',
        title: 'Data sharing',
        explanation: 'Data is shared with partners.',
        sourceText: 'Data is shared with third-party partners.',
        sourceReference: { headingPath: [], containerDescriptor: 'paragraph', sourceIndex: 2 },
      },
      {
        id: 'cancel',
        category: 'cancellation',
        importance: 'medium',
        confidence: 'medium',
        title: 'Cancellation notice',
        explanation: 'Requires 30 days notice.',
        sourceText: 'Cancellation requires 30 days notice.',
        sourceReference: { headingPath: [], containerDescriptor: 'paragraph', sourceIndex: 3 },
      },
    ]),
  )
  const raw = (await provider.analyze(request)) as GeminiContentPayload
  const categories = raw.attentionItems.map((item) => item.category).sort()
  assert.deepEqual(categories, ['autoRenewal', 'cancellation', 'dataSharing', 'recurringCharges'])
})

test('the canonical analysis is structurally identical across requested languages', async () => {
  const provider = createGeminiProvider(async () =>
    payloadWithItems([
      {
        id: 'a',
        category: 'autoRenewal',
        importance: 'high',
        confidence: 'high',
        title: 'Automatic renewal',
        explanation: 'Renews monthly.',
        sourceText: 'Your subscription renews automatically each month.',
        sourceReference: { headingPath: [], containerDescriptor: 'paragraph', sourceIndex: 0 },
      },
    ]),
  )
  const en = (await provider.analyze(baseRequest({ language: 'en' }))) as GeminiContentPayload
  const kn = (await provider.analyze(baseRequest({ language: 'kn' }))) as GeminiContentPayload
  const hi = (await provider.analyze(baseRequest({ language: 'hi' }))) as GeminiContentPayload

  for (const raw of [en, kn, hi]) {
    const result = validateAnalysisResult(raw, context)
    assert.equal(result.ok, true)
  }
  assert.deepEqual(en.attentionItems, kn.attentionItems)
  assert.deepEqual(en.attentionItems, hi.attentionItems)
})
