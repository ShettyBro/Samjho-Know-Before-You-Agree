import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { MAX_CONTENT_LENGTH } from './limits.js'
import { validateAnalysisRequest } from './requestValidation.js'

function validRequestBody(): Record<string, unknown> {
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

test('a valid request passes validation', () => {
  const result = validateAnalysisRequest(validRequestBody())
  assert.equal(result.ok, true)
})

test('a missing agreementId produces VALIDATION_ERROR', () => {
  const body = validRequestBody()
  delete body.agreementId
  const result = validateAnalysisRequest(body)
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, 'VALIDATION_ERROR')
})

test('missing content produces VALIDATION_ERROR', () => {
  const body = validRequestBody()
  body.normalizedText = ''
  const result = validateAnalysisRequest(body)
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, 'VALIDATION_ERROR')
})

test('an unsupported language produces UNSUPPORTED_LANGUAGE', () => {
  const body = validRequestBody()
  body.language = 'xx'
  const result = validateAnalysisRequest(body)
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, 'UNSUPPORTED_LANGUAGE')
})

test('oversized content produces PAYLOAD_TOO_LARGE', () => {
  const body = validRequestBody()
  body.normalizedText = 'a'.repeat(MAX_CONTENT_LENGTH + 1)
  const result = validateAnalysisRequest(body)
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, 'PAYLOAD_TOO_LARGE')
})

test('an invalid URL produces a controlled validation failure', () => {
  const body = validRequestBody()
  body.sourceUrl = 'not-a-url'
  const result = validateAnalysisRequest(body)
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, 'VALIDATION_ERROR')
})

test('an unsupported source type produces INVALID_SOURCE', () => {
  const body = validRequestBody()
  body.sourceType = 'bogusSource'
  const result = validateAnalysisRequest(body)
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, 'INVALID_SOURCE')
})
