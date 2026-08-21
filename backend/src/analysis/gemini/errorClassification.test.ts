import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { classifyGeminiError } from './errorClassification.js'

test('a daily quota exhaustion message classifies as QUOTA_EXHAUSTED', () => {
  const error = {
    status: 429,
    message: JSON.stringify({
      error: {
        code: 429,
        status: 'RESOURCE_EXHAUSTED',
        message: 'quotaId: GenerateRequestsPerDayPerProjectPerModel-FreeTier',
      },
    }),
  }
  const result = classifyGeminiError(error)
  assert.equal(result.category, 'QUOTA_EXHAUSTED')
  assert.equal(result.httpStatus, 429)
  assert.equal(result.providerCode, 'RESOURCE_EXHAUSTED')
})

test('a generic 429 without daily-quota wording classifies as RATE_LIMITED', () => {
  const error = { status: 429, message: JSON.stringify({ error: { code: 429, status: 'RESOURCE_EXHAUSTED', message: 'too many requests per minute' } }) }
  const result = classifyGeminiError(error)
  assert.equal(result.category, 'RATE_LIMITED')
})

test('a 401 classifies as AUTHENTICATION_ERROR', () => {
  const result = classifyGeminiError({ status: 401, message: 'invalid api key' })
  assert.equal(result.category, 'AUTHENTICATION_ERROR')
})

test('a 403 classifies as AUTHENTICATION_ERROR', () => {
  const result = classifyGeminiError({ status: 403, message: 'permission denied' })
  assert.equal(result.category, 'AUTHENTICATION_ERROR')
})

test('a 404 classifies as MODEL_UNAVAILABLE', () => {
  const result = classifyGeminiError({ status: 404, message: 'model not found' })
  assert.equal(result.category, 'MODEL_UNAVAILABLE')
})

test('a 400 classifies as INVALID_REQUEST', () => {
  const result = classifyGeminiError({ status: 400, message: 'Request contains an invalid argument.' })
  assert.equal(result.category, 'INVALID_REQUEST')
})

test('a timeout-shaped error classifies as TIMEOUT', () => {
  const result = classifyGeminiError(new Error('The operation timed out'))
  assert.equal(result.category, 'TIMEOUT')
})

test('a network-shaped error classifies as NETWORK_ERROR', () => {
  const result = classifyGeminiError(new Error('fetch failed'))
  assert.equal(result.category, 'NETWORK_ERROR')
})

test('an unrecognized error classifies as PROVIDER_ERROR rather than guessing', () => {
  const result = classifyGeminiError({ weird: 'shape' })
  assert.equal(result.category, 'PROVIDER_ERROR')
})

test('classification never includes the raw message text as an output field', () => {
  const result = classifyGeminiError({ status: 401, message: 'invalid api key: super-secret-value' })
  assert.ok(!JSON.stringify(result).includes('super-secret-value'))
})
