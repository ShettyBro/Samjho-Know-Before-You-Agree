import { strict as assert } from 'node:assert'
import { after, before, test } from 'node:test'
import type { AddressInfo } from 'node:net'
import { createApp } from '../app.js'

let baseUrl: string
let server: ReturnType<ReturnType<typeof createApp>['listen']>

before(() => {
  return new Promise<void>((resolve) => {
    const app = createApp()
    server = app.listen(0, () => {
      const address = server.address() as AddressInfo
      baseUrl = `http://127.0.0.1:${address.port}`
      resolve()
    })
  })
})

after(() => {
  return new Promise<void>((resolve) => server.close(() => resolve()))
})

function validRequestBody() {
  return {
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
}

test('a valid analysis request returns 200 with a validated result', async () => {
  const response = await fetch(`${baseUrl}/api/v1/agreements/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validRequestBody()),
  })
  assert.equal(response.status, 200)
  assert.match(response.headers.get('content-type') ?? '', /application\/json/)
  const body = (await response.json()) as Record<string, any>
  assert.equal(body.agreementId, 'agr:abc123')
  assert.equal(body.analysisVersion, 'v1')
  assert.ok(Array.isArray(body.attentionItems))
  assert.ok(body.disclaimer.length > 0)
})

test('API error handling returns a machine-readable code and a safe message', async () => {
  const body = validRequestBody()
  delete (body as Record<string, unknown>).agreementId
  const response = await fetch(`${baseUrl}/api/v1/agreements/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  assert.equal(response.status, 400)
  const payload = (await response.json()) as Record<string, any>
  assert.equal(payload.code, 'VALIDATION_ERROR')
  assert.equal(typeof payload.message, 'string')
  assert.ok(!('stack' in payload))
})

test('extraction-shaped data flows through the mock provider to a validated API response with no Gemini involved', async () => {
  const extractionShapedRequest = {
    agreementId: 'agr:extractionflow',
    contentHash: 'sha256:extractionflowhash',
    sourceType: 'samePage',
    normalizedText: 'You agree that your membership automatically renews each month.\nData is shared with third parties.',
    originalText: 'You agree that your membership automatically renews each month.\nData is shared with third parties.',
    analysisVersion: 'v1',
    language: 'en',
  }
  const response = await fetch(`${baseUrl}/api/v1/agreements/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(extractionShapedRequest),
  })
  assert.equal(response.status, 200)
  const body = (await response.json()) as Record<string, any>
  assert.equal(body.providerMetadata.provider, 'mock')
  assert.ok(body.dataSharing.available)
})
