import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { InMemoryAnalysisCache } from './AnalysisCache.js'
import type { AnalysisResult } from '../analysis/types.js'

function fakeResult(overrides: Partial<AnalysisResult> = {}): AnalysisResult {
  return {
    agreementId: 'agr:a',
    contentHash: 'sha256:a',
    analysisVersion: 'v1',
    summary: [],
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
    providerMetadata: { provider: 'fake', model: 'fake', generatedAt: '2024-01-01T00:00:00.000Z', inputHash: 'sha256:a', schemaVersion: 'v1' },
    ...overrides,
  }
}

test('get/set/has/delete behave as a basic key-value store', () => {
  const cache = new InMemoryAnalysisCache(10)
  assert.equal(cache.has('k1'), false)
  cache.set({ cacheKey: 'k1', agreementId: 'a', contentHash: 'h', analysisVersion: 'v1', result: fakeResult(), createdAt: 0, expiresAt: Number.MAX_SAFE_INTEGER })
  assert.equal(cache.has('k1'), true)
  assert.equal(cache.get('k1')?.cacheKey, 'k1')
  cache.delete('k1')
  assert.equal(cache.has('k1'), false)
})

test('clear removes every entry', () => {
  const cache = new InMemoryAnalysisCache(10)
  cache.set({ cacheKey: 'k1', agreementId: 'a', contentHash: 'h', analysisVersion: 'v1', result: fakeResult(), createdAt: 0, expiresAt: Number.MAX_SAFE_INTEGER })
  cache.set({ cacheKey: 'k2', agreementId: 'a', contentHash: 'h2', analysisVersion: 'v1', result: fakeResult(), createdAt: 0, expiresAt: Number.MAX_SAFE_INTEGER })
  cache.clear()
  assert.equal(cache.size(), 0)
})

test('an entry past its TTL is treated as a miss and removed', () => {
  let currentTime = 1000
  const cache = new InMemoryAnalysisCache(10, () => currentTime)
  cache.set({ cacheKey: 'k1', agreementId: 'a', contentHash: 'h', analysisVersion: 'v1', result: fakeResult(), createdAt: currentTime, expiresAt: currentTime + 500 })
  assert.equal(cache.has('k1'), true)
  currentTime += 600
  assert.equal(cache.get('k1'), undefined)
  assert.equal(cache.has('k1'), false)
  assert.equal(cache.size(), 0)
})

test('inserting beyond the configured maximum evicts the least recently used entry', () => {
  const cache = new InMemoryAnalysisCache(2)
  cache.set({ cacheKey: 'k1', agreementId: 'a', contentHash: 'h1', analysisVersion: 'v1', result: fakeResult(), createdAt: 0, expiresAt: Number.MAX_SAFE_INTEGER })
  cache.set({ cacheKey: 'k2', agreementId: 'a', contentHash: 'h2', analysisVersion: 'v1', result: fakeResult(), createdAt: 0, expiresAt: Number.MAX_SAFE_INTEGER })
  cache.get('k1')
  cache.set({ cacheKey: 'k3', agreementId: 'a', contentHash: 'h3', analysisVersion: 'v1', result: fakeResult(), createdAt: 0, expiresAt: Number.MAX_SAFE_INTEGER })
  assert.equal(cache.size(), 2)
  assert.equal(cache.has('k2'), false)
  assert.equal(cache.has('k1'), true)
  assert.equal(cache.has('k3'), true)
})
