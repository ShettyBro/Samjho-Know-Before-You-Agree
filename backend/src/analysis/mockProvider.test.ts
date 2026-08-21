import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { mockProvider } from './mockProvider.js'
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

test('the mock provider produces a deterministic result for the same input', async () => {
  const first = await mockProvider.analyze(request)
  const second = await mockProvider.analyze(request)
  assert.deepEqual(first, second)
})

test('the mock provider never touches the network or requires credentials', async () => {
  const result = await mockProvider.analyze(request)
  assert.equal(mockProvider.name, 'mock')
  assert.ok(result)
})
