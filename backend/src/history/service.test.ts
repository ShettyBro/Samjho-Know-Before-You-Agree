import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import type { AnalysisResult } from '../analysis/types.js'
import { createInMemoryHistoryRepository } from './repository.js'
import { getSavedResult, listHistory, listSaved, saveAgreement } from './service.js'

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

test('a history list marks a row as changed purely from a stored hash comparison, with no AI call involved', async () => {
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

  const items = await listHistory('user-1', repo)
  assert.equal(items.length, 1)
  assert.equal(items[0].changed, true)
  assert.equal(items[0].previousContentHash, 'sha256:h1')
  assert.equal(items[0].contentHash, 'sha256:h2')
})

test('a saved agreement is flagged as changed once a newer analysis of the same agreementId is recorded', async () => {
  const repo = createInMemoryHistoryRepository()
  await saveAgreement(
    {
      userId: 'user-1',
      agreementId: 'agr:a',
      contentHash: 'sha256:h1',
      analysisVersion: 'v1',
      title: 'Terms of Service',
      structuredResult: fakeResult(),
    },
    repo,
  )

  let savedItems = await listSaved('user-1', repo)
  assert.equal(savedItems[0].changed, false)

  await repo.recordHistory({
    userId: 'user-1',
    agreementId: 'agr:a',
    contentHash: 'sha256:h2',
    analysisVersion: 'v1',
    title: 'Terms of Service',
    structuredResult: fakeResult({ contentHash: 'sha256:h2' }),
  })

  savedItems = await listSaved('user-1', repo)
  assert.equal(savedItems[0].changed, true)
  assert.equal(savedItems[0].latestContentHash, 'sha256:h2')
})

test('getSavedResult returns the exact structured result snapshot taken at save time', async () => {
  const repo = createInMemoryHistoryRepository()
  const result = fakeResult({ summary: ['A specific saved summary.'] })
  await saveAgreement(
    {
      userId: 'user-1',
      agreementId: 'agr:a',
      contentHash: 'sha256:h1',
      analysisVersion: 'v1',
      title: 'Terms of Service',
      structuredResult: result,
    },
    repo,
  )

  const stored = await getSavedResult('user-1', 'agr:a', repo)
  assert.deepEqual(stored?.summary, ['A specific saved summary.'])
})
