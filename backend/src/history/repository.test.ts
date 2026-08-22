import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import type { AnalysisResult } from '../analysis/types.js'
import { createInMemoryHistoryRepository } from './repository.js'

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

test('an authenticated user creates a history record on first analysis', async () => {
  const repo = createInMemoryHistoryRepository()
  await repo.recordHistory({
    userId: 'user-1',
    agreementId: 'agr:a',
    contentHash: 'sha256:h1',
    analysisVersion: 'v1',
    title: 'Terms of Service',
    structuredResult: fakeResult(),
  })

  const rows = await repo.listHistory('user-1', 50)
  assert.equal(rows.length, 1)
  assert.equal(rows[0].agreementId, 'agr:a')
  assert.equal(rows[0].previousContentHash, undefined)
})

test('a user retrieves only their own history, never another user\'s', async () => {
  const repo = createInMemoryHistoryRepository()
  await repo.recordHistory({
    userId: 'user-1',
    agreementId: 'agr:a',
    contentHash: 'sha256:h1',
    analysisVersion: 'v1',
    title: 'User 1 agreement',
    structuredResult: fakeResult(),
  })
  await repo.recordHistory({
    userId: 'user-2',
    agreementId: 'agr:b',
    contentHash: 'sha256:h2',
    analysisVersion: 'v1',
    title: 'User 2 agreement',
    structuredResult: fakeResult({ agreementId: 'agr:b', contentHash: 'sha256:h2' }),
  })

  const userOneHistory = await repo.listHistory('user-1', 50)
  const userTwoHistory = await repo.listHistory('user-2', 50)

  assert.equal(userOneHistory.length, 1)
  assert.equal(userOneHistory[0].title, 'User 1 agreement')
  assert.equal(userTwoHistory.length, 1)
  assert.equal(userTwoHistory[0].title, 'User 2 agreement')

  const crossUserLookup = await repo.getHistoryRow('user-2', 'agr:a')
  assert.equal(crossUserLookup, undefined)
})

test('re-encountering the same agreement with a new hash records a new version and preserves the previous one', async () => {
  const repo = createInMemoryHistoryRepository()
  await repo.recordHistory({
    userId: 'user-1',
    agreementId: 'agr:a',
    contentHash: 'sha256:h1',
    analysisVersion: 'v1',
    title: 'Terms of Service',
    structuredResult: fakeResult(),
  })
  await repo.recordHistory({
    userId: 'user-1',
    agreementId: 'agr:a',
    contentHash: 'sha256:h2',
    analysisVersion: 'v1',
    title: 'Terms of Service',
    structuredResult: fakeResult({ contentHash: 'sha256:h2' }),
  })

  const rows = await repo.listHistory('user-1', 50)
  assert.equal(rows.length, 1)
  assert.equal(rows[0].contentHash, 'sha256:h2')
  assert.equal(rows[0].previousContentHash, 'sha256:h1')
})

test('re-encountering the same agreement with the same hash does not create a spurious version change', async () => {
  const repo = createInMemoryHistoryRepository()
  await repo.recordHistory({
    userId: 'user-1',
    agreementId: 'agr:a',
    contentHash: 'sha256:h1',
    analysisVersion: 'v1',
    title: 'Terms of Service',
    structuredResult: fakeResult(),
  })
  await repo.recordHistory({
    userId: 'user-1',
    agreementId: 'agr:a',
    contentHash: 'sha256:h1',
    analysisVersion: 'v1',
    title: 'Terms of Service',
    structuredResult: fakeResult(),
  })

  const rows = await repo.listHistory('user-1', 50)
  assert.equal(rows.length, 1)
  assert.equal(rows[0].previousContentHash, undefined)
})

test('a different agreementId for the same user produces an independent history row', async () => {
  const repo = createInMemoryHistoryRepository()
  await repo.recordHistory({
    userId: 'user-1',
    agreementId: 'agr:a',
    contentHash: 'sha256:h1',
    analysisVersion: 'v1',
    title: 'Terms of Service',
    structuredResult: fakeResult(),
  })
  await repo.recordHistory({
    userId: 'user-1',
    agreementId: 'agr:privacy',
    contentHash: 'sha256:h1',
    analysisVersion: 'v1',
    title: 'Privacy Policy',
    structuredResult: fakeResult({ agreementId: 'agr:privacy' }),
  })

  const rows = await repo.listHistory('user-1', 50)
  assert.equal(rows.length, 2)
  const ids = rows.map((row) => row.agreementId).sort()
  assert.deepEqual(ids, ['agr:a', 'agr:privacy'])
})

test('saving an agreement is idempotent on repeat save calls', async () => {
  const repo = createInMemoryHistoryRepository()
  await repo.saveAgreement({
    userId: 'user-1',
    agreementId: 'agr:a',
    contentHash: 'sha256:h1',
    analysisVersion: 'v1',
    title: 'Terms of Service',
    structuredResult: fakeResult(),
  })
  await repo.saveAgreement({
    userId: 'user-1',
    agreementId: 'agr:a',
    contentHash: 'sha256:h1',
    analysisVersion: 'v1',
    title: 'Terms of Service',
    structuredResult: fakeResult(),
  })

  const rows = await repo.listSaved('user-1', 50)
  assert.equal(rows.length, 1)
})

test('unsaving an agreement removes it, and unsaving again is a harmless no-op', async () => {
  const repo = createInMemoryHistoryRepository()
  await repo.saveAgreement({
    userId: 'user-1',
    agreementId: 'agr:a',
    contentHash: 'sha256:h1',
    analysisVersion: 'v1',
    title: 'Terms of Service',
    structuredResult: fakeResult(),
  })

  await repo.unsaveAgreement('user-1', 'agr:a')
  assert.equal((await repo.listSaved('user-1', 50)).length, 0)

  await repo.unsaveAgreement('user-1', 'agr:a')
  assert.equal((await repo.listSaved('user-1', 50)).length, 0)
})
