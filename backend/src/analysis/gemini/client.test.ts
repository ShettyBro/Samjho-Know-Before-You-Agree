import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { ApiError } from '../errors.js'
import { classifyGeminiError } from './errorClassification.js'
import { assertGeminiConfigured, errorForClassification, mapGeminiError } from './client.js'

test('a missing API key produces a controlled PROVIDER_ERROR rather than a crash', () => {
  assert.throws(() => assertGeminiConfigured(undefined), (error: unknown) => {
    assert.ok(error instanceof ApiError)
    assert.equal(error.code, 'PROVIDER_ERROR')
    return true
  })
})

test('a configured API key passes the configuration check', () => {
  assert.doesNotThrow(() => assertGeminiConfigured('some-key'))
})

test('an unauthorized status maps to a safe PROVIDER_ERROR without leaking the credential', () => {
  const mapped = mapGeminiError({ status: 401, message: 'invalid api key: super-secret-value' })
  assert.equal(mapped.code, 'PROVIDER_ERROR')
  assert.ok(!mapped.message.includes('super-secret-value'))
})

test('a model-not-found status maps to a safe PROVIDER_ERROR', () => {
  const mapped = mapGeminiError({ status: 404, message: 'model not found' })
  assert.equal(mapped.code, 'PROVIDER_ERROR')
})

test('a rate-limit status maps to a safe PROVIDER_ERROR', () => {
  const mapped = mapGeminiError({ status: 429, message: 'quota exceeded' })
  assert.equal(mapped.code, 'PROVIDER_ERROR')
})

test('a timeout-shaped error maps to a safe PROVIDER_ERROR', () => {
  const mapped = mapGeminiError(new Error('The operation timed out'))
  assert.equal(mapped.code, 'PROVIDER_ERROR')
})

test('an unrecognized error still maps to a safe PROVIDER_ERROR rather than throwing raw internals', () => {
  const mapped = mapGeminiError({ weird: 'shape' })
  assert.equal(mapped.code, 'PROVIDER_ERROR')
})

test('a rate-limited classification produces a distinct RATE_LIMITED error with a 429 status', () => {
  const classification = classifyGeminiError({ status: 429, message: JSON.stringify({ error: { status: 'RESOURCE_EXHAUSTED' } }) })
  const error = errorForClassification(classification)
  assert.equal(error.code, 'RATE_LIMITED')
  assert.equal(error.status, 429)
})

test('a daily-quota classification produces a distinct QUOTA_EXHAUSTED error with a 429 status', () => {
  const classification = classifyGeminiError({
    status: 429,
    message: JSON.stringify({ error: { status: 'RESOURCE_EXHAUSTED' } }) + ' perDay',
  })
  const error = errorForClassification(classification)
  assert.equal(error.code, 'QUOTA_EXHAUSTED')
  assert.equal(error.status, 429)
})

test('every other classification still maps to a safe generic PROVIDER_ERROR', () => {
  const error = errorForClassification({ category: 'NETWORK_ERROR' })
  assert.equal(error.code, 'PROVIDER_ERROR')
  assert.equal(error.status, 502)
})
