import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { ApiError } from '../analysis/errors.js'
import type { AgreementAnalysisProvider } from '../analysis/provider.js'
import type { AnalysisRequest } from '../analysis/types.js'
import { InMemoryAnalysisCache } from './AnalysisCache.js'
import { createCachedAnalysisService } from './cachedAnalysisService.js'

function baseRequest(overrides: Partial<AnalysisRequest> = {}): AnalysisRequest {
  return {
    agreementId: 'agr:a',
    contentHash: 'sha256:a',
    sourceType: 'samePage',
    normalizedText: 'Your subscription renews automatically each month.',
    originalText: 'Your subscription renews automatically each month.',
    analysisVersion: 'v1',
    language: 'en',
    ...overrides,
  }
}

function emptySection() {
  return { available: false, summary: [], relatedAttentionItemIds: [] }
}

type ProviderBehavior = 'success' | 'invalid' | 'throw'

function createFakeProvider(behavior: (request: AnalysisRequest, callIndex: number) => ProviderBehavior = () => 'success', delayMs = 0) {
  let callCount = 0
  const provider: AgreementAnalysisProvider = {
    name: 'fake',
    async analyze(request: AnalysisRequest) {
      const callIndex = callCount
      callCount += 1
      if (delayMs > 0) await new Promise((resolve) => setTimeout(resolve, delayMs))
      const outcome = behavior(request, callIndex)
      if (outcome === 'throw') throw new Error('simulated transient provider failure')
      if (outcome === 'invalid') return { nonsense: true }
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

test('a new agreement is a cache miss', async () => {
  const { provider } = createFakeProvider()
  const service = createCachedAnalysisService({ cache: new InMemoryAnalysisCache(50), provider, ttlMs: 60000 })
  const cacheKey = 'agr:a:sha256:a:v1'
  assert.equal(service.statusFor(cacheKey), 'MISS')
})

test('the same agreementId, contentHash, and analysisVersion after a successful analysis is a cache hit with no new provider call', async () => {
  const { provider, callCount } = createFakeProvider()
  const service = createCachedAnalysisService({ cache: new InMemoryAnalysisCache(50), provider, ttlMs: 60000 })

  const first = await service.getOrAnalyze(baseRequest())
  assert.equal(first.ok, true)
  assert.equal(callCount(), 1)

  const second = await service.getOrAnalyze(baseRequest())
  assert.equal(second.ok, true)
  assert.equal(callCount(), 1)
  if (first.ok && second.ok) assert.deepEqual(first.value.result, second.value.result)
})

test('duplicate concurrent requests for the same key produce exactly one provider invocation', async () => {
  const { provider, callCount } = createFakeProvider(() => 'success', 20)
  const service = createCachedAnalysisService({ cache: new InMemoryAnalysisCache(50), provider, ttlMs: 60000 })

  const [a, b] = await Promise.all([service.getOrAnalyze(baseRequest()), service.getOrAnalyze(baseRequest())])
  assert.equal(callCount(), 1)
  assert.equal(a.ok, true)
  assert.equal(b.ok, true)
  if (a.ok && b.ok) assert.deepEqual(a.value.result, b.value.result)
})

test('concurrent requests for different agreements may both invoke the provider and keep separate results', async () => {
  const { provider, callCount } = createFakeProvider(() => 'success', 20)
  const service = createCachedAnalysisService({ cache: new InMemoryAnalysisCache(50), provider, ttlMs: 60000 })

  const [a, b] = await Promise.all([
    service.getOrAnalyze(baseRequest({ agreementId: 'agr:a' })),
    service.getOrAnalyze(baseRequest({ agreementId: 'agr:b', contentHash: 'sha256:b' })),
  ])
  assert.equal(callCount(), 2)
  assert.equal(a.ok, true)
  assert.equal(b.ok, true)
  if (a.ok && b.ok) assert.notEqual(a.value.cacheKey, b.value.cacheKey)
})

test('the same agreementId with a changed contentHash is a cache miss and triggers a new provider invocation', async () => {
  const { provider, callCount } = createFakeProvider()
  const service = createCachedAnalysisService({ cache: new InMemoryAnalysisCache(50), provider, ttlMs: 60000 })

  await service.getOrAnalyze(baseRequest({ contentHash: 'sha256:v1' }))
  assert.equal(callCount(), 1)
  await service.getOrAnalyze(baseRequest({ contentHash: 'sha256:v2' }))
  assert.equal(callCount(), 2)
})

test('a changed analysisVersion for the same agreementId and contentHash is a cache miss', async () => {
  const { provider, callCount } = createFakeProvider()
  const service = createCachedAnalysisService({ cache: new InMemoryAnalysisCache(50), provider, ttlMs: 60000 })

  await service.getOrAnalyze(baseRequest({ analysisVersion: 'v1' }))
  assert.equal(callCount(), 1)
  await service.getOrAnalyze(baseRequest({ analysisVersion: 'v2' }))
  assert.equal(callCount(), 2)
})

test('a failed provider request produces no successful cache entry', async () => {
  const { provider } = createFakeProvider(() => 'throw')
  const cache = new InMemoryAnalysisCache(50)
  const service = createCachedAnalysisService({ cache, provider, ttlMs: 60000 })

  const result = await service.getOrAnalyze(baseRequest())
  assert.equal(result.ok, false)
  assert.equal(cache.size(), 0)
})

test('a validation failure means nothing invalid enters the cache', async () => {
  const { provider } = createFakeProvider(() => 'invalid')
  const cache = new InMemoryAnalysisCache(50)
  const service = createCachedAnalysisService({ cache, provider, ttlMs: 60000 })

  const result = await service.getOrAnalyze(baseRequest())
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, 'ANALYSIS_SCHEMA_ERROR')
  assert.equal(cache.size(), 0)
})

test('an entry becomes a miss once the TTL has elapsed according to the injected clock', async () => {
  let currentTime = 1000
  const { provider, callCount } = createFakeProvider()
  const service = createCachedAnalysisService({
    cache: new InMemoryAnalysisCache(50, () => currentTime),
    provider,
    ttlMs: 500,
    now: () => currentTime,
  })

  await service.getOrAnalyze(baseRequest())
  assert.equal(callCount(), 1)
  currentTime += 1000
  await service.getOrAnalyze(baseRequest())
  assert.equal(callCount(), 2)
})

test('inserting beyond the configured cache limit evicts the least recently used entry', async () => {
  const { provider } = createFakeProvider()
  const cache = new InMemoryAnalysisCache(2)
  const service = createCachedAnalysisService({ cache, provider, ttlMs: 60000 })

  await service.getOrAnalyze(baseRequest({ agreementId: 'a1', contentHash: 'h1' }))
  await service.getOrAnalyze(baseRequest({ agreementId: 'a2', contentHash: 'h2' }))
  await service.getOrAnalyze(baseRequest({ agreementId: 'a3', contentHash: 'h3' }))

  assert.equal(cache.size(), 2)
  assert.equal(cache.has('a1:h1:v1'), false)
  assert.equal(cache.has('a3:h3:v1'), true)
})

test('an analysis for one document/agreement finishing after another begins does not attach its result to the other', async () => {
  const { provider } = createFakeProvider((request) => (request.agreementId === 'doc-a' ? 'success' : 'success'), 30)
  const cache = new InMemoryAnalysisCache(50)
  const service = createCachedAnalysisService({ cache, provider, ttlMs: 60000 })

  const documentAPromise = service.getOrAnalyze(baseRequest({ agreementId: 'doc-a', contentHash: 'hash-a' }))
  const documentBResult = await service.getOrAnalyze(baseRequest({ agreementId: 'doc-b', contentHash: 'hash-b' }))
  const documentAResult = await documentAPromise

  assert.equal(documentAResult.ok, true)
  assert.equal(documentBResult.ok, true)
  if (documentAResult.ok && documentBResult.ok) {
    assert.equal(documentAResult.value.result.agreementId, 'doc-a')
    assert.equal(documentBResult.value.result.agreementId, 'doc-b')
    assert.notEqual(documentAResult.value.cacheKey, documentBResult.value.cacheKey)
  }
})

test('two independent document contexts with identical agreementId, contentHash, and analysisVersion reuse the same cached result', async () => {
  const { provider, callCount } = createFakeProvider()
  const service = createCachedAnalysisService({ cache: new InMemoryAnalysisCache(50), provider, ttlMs: 60000 })

  const documentOne = await service.getOrAnalyze(baseRequest({ sourceType: 'samePage' }))
  const documentTwo = await service.getOrAnalyze(baseRequest({ sourceType: 'sameOriginLink', resolvedUrl: 'https://example.com/terms' }))

  assert.equal(callCount(), 1)
  assert.equal(documentOne.ok, true)
  assert.equal(documentTwo.ok, true)
  if (documentOne.ok && documentTwo.ok) assert.deepEqual(documentOne.value.result, documentTwo.value.result)
})

test('requests that would originate from different discovery candidates but resolve to the same identity produce one cache entry', async () => {
  const { provider, callCount } = createFakeProvider()
  const cache = new InMemoryAnalysisCache(50)
  const service = createCachedAnalysisService({ cache, provider, ttlMs: 60000 })

  await service.getOrAnalyze(baseRequest())
  await service.getOrAnalyze(baseRequest())
  assert.equal(callCount(), 1)
  assert.equal(cache.size(), 1)
})

test('a provider quota-exhaustion style error is a controlled failure with no successful cache entry', async () => {
  const { provider } = createFakeProvider(() => 'throw')
  const cache = new InMemoryAnalysisCache(50)
  const service = createCachedAnalysisService({ cache, provider, ttlMs: 60000 })

  const result = await service.getOrAnalyze(baseRequest())
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, 'PROVIDER_ERROR')
  assert.equal(cache.size(), 0)
})

test('clearing the cache makes the next request a miss', async () => {
  const { provider, callCount } = createFakeProvider()
  const cache = new InMemoryAnalysisCache(50)
  const service = createCachedAnalysisService({ cache, provider, ttlMs: 60000 })

  await service.getOrAnalyze(baseRequest())
  assert.equal(callCount(), 1)
  cache.clear()
  await service.getOrAnalyze(baseRequest())
  assert.equal(callCount(), 2)
})

test('prefetch returns quickly with a PREFETCHING status on miss and does not block the caller', async () => {
  const { provider, callCount } = createFakeProvider(() => 'success', 50)
  const cache = new InMemoryAnalysisCache(50)
  const service = createCachedAnalysisService({ cache, provider, ttlMs: 60000 })

  const startedAt = Date.now()
  const result = service.prefetch(baseRequest())
  const elapsedMs = Date.now() - startedAt

  assert.equal(result.ok, true)
  if (result.ok) assert.equal(result.value.status, 'PREFETCHING')
  assert.ok(elapsedMs < 50)
  assert.equal(cache.size(), 0)

  await new Promise((resolve) => setTimeout(resolve, 80))
  assert.equal(callCount(), 1)
  assert.equal(cache.size(), 1)
})

test('prefetch and explicit analysis share the same in-flight request', async () => {
  const { provider, callCount } = createFakeProvider(() => 'success', 30)
  const cache = new InMemoryAnalysisCache(50)
  const service = createCachedAnalysisService({ cache, provider, ttlMs: 60000 })

  const prefetchResult = service.prefetch(baseRequest())
  assert.equal(prefetchResult.ok, true)
  const explicitResult = await service.getOrAnalyze(baseRequest())

  assert.equal(callCount(), 1)
  assert.equal(explicitResult.ok, true)
})

function createRateLimitedProvider(code: 'RATE_LIMITED' | 'QUOTA_EXHAUSTED' = 'RATE_LIMITED') {
  let callCount = 0
  const provider: AgreementAnalysisProvider = {
    name: 'fake-rate-limited',
    async analyze() {
      callCount += 1
      throw new ApiError(code, 429, 'Samjho is receiving too many requests right now.')
    },
  }
  return { provider, callCount: () => callCount }
}

test('a RATE_LIMITED provider failure starts a cooldown that refuses an immediate automatic re-analysis', async () => {
  const { provider, callCount } = createRateLimitedProvider('RATE_LIMITED')
  const service = createCachedAnalysisService({ cache: new InMemoryAnalysisCache(50), provider, ttlMs: 60000 })

  const first = await service.getOrAnalyze(baseRequest())
  assert.equal(first.ok, false)
  if (!first.ok) assert.equal(first.error.code, 'RATE_LIMITED')
  assert.equal(callCount(), 1)

  const second = await service.getOrAnalyze(baseRequest())
  assert.equal(second.ok, false)
  if (!second.ok) assert.equal(second.error.code, 'RATE_LIMITED')
  assert.equal(callCount(), 1)
})

test('a QUOTA_EXHAUSTED provider failure also starts a cooldown that refuses an immediate retry', async () => {
  const { provider, callCount } = createRateLimitedProvider('QUOTA_EXHAUSTED')
  const service = createCachedAnalysisService({ cache: new InMemoryAnalysisCache(50), provider, ttlMs: 60000 })

  await service.getOrAnalyze(baseRequest())
  assert.equal(callCount(), 1)

  const second = await service.getOrAnalyze(baseRequest())
  assert.equal(second.ok, false)
  if (!second.ok) assert.equal(second.error.code, 'QUOTA_EXHAUSTED')
  assert.equal(callCount(), 1)
})

test('prefetch during an active rate-limit cooldown reports RATE_LIMITED status and does not call the provider again', async () => {
  const { provider, callCount } = createRateLimitedProvider('RATE_LIMITED')
  const service = createCachedAnalysisService({ cache: new InMemoryAnalysisCache(50), provider, ttlMs: 60000 })

  await service.getOrAnalyze(baseRequest())
  assert.equal(callCount(), 1)

  const prefetchResult = service.prefetch(baseRequest())
  assert.equal(prefetchResult.ok, true)
  if (prefetchResult.ok) assert.equal(prefetchResult.value.status, 'RATE_LIMITED')
  assert.equal(callCount(), 1)
})

test('statusFor reports RATE_LIMITED while a cooldown for that cache key is active', async () => {
  const { provider } = createRateLimitedProvider('RATE_LIMITED')
  const service = createCachedAnalysisService({ cache: new InMemoryAnalysisCache(50), provider, ttlMs: 60000 })

  await service.getOrAnalyze(baseRequest())
  assert.equal(service.statusFor('agr:a:sha256:a:v1'), 'RATE_LIMITED')
})

test('the rate-limit cooldown expires after its configured duration, allowing a fresh analysis attempt', async () => {
  let currentTime = 1000
  const { provider, callCount } = createRateLimitedProvider('RATE_LIMITED')
  const service = createCachedAnalysisService({
    cache: new InMemoryAnalysisCache(50),
    provider,
    ttlMs: 60000,
    now: () => currentTime,
    cooldownMs: 500,
  })

  await service.getOrAnalyze(baseRequest())
  assert.equal(callCount(), 1)

  const stillCoolingDown = await service.getOrAnalyze(baseRequest())
  assert.equal(stillCoolingDown.ok, false)
  assert.equal(callCount(), 1)

  currentTime += 1000
  const afterCooldown = await service.getOrAnalyze(baseRequest())
  assert.equal(afterCooldown.ok, false)
  assert.equal(callCount(), 2)
})

test('a non-rate-limit provider failure does not start a cooldown, so the next attempt calls the provider again', async () => {
  const { provider, callCount } = createFakeProvider(() => 'throw')
  const service = createCachedAnalysisService({ cache: new InMemoryAnalysisCache(50), provider, ttlMs: 60000 })

  await service.getOrAnalyze(baseRequest())
  assert.equal(callCount(), 1)

  await service.getOrAnalyze(baseRequest())
  assert.equal(callCount(), 2)
})
