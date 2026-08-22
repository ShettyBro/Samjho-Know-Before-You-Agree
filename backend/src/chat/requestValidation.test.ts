import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { MAX_AGREEMENT_TEXT_LENGTH, MAX_HISTORY_MESSAGES, MAX_QUESTION_LENGTH } from './limits.js'
import { validateChatRequest } from './requestValidation.js'

function baseRequest(overrides: Record<string, unknown> = {}) {
  return {
    agreementId: 'agr:a',
    contentHash: 'sha256:a',
    analysisVersion: 'v1',
    question: 'Will this renew automatically?',
    language: 'en',
    agreementText: 'Your subscription renews automatically each month.',
    history: [],
    ...overrides,
  }
}

test('a valid chat request passes validation', () => {
  const result = validateChatRequest(baseRequest())
  assert.equal(result.ok, true)
})

test('a missing agreementId produces VALIDATION_ERROR', () => {
  const request = baseRequest({ agreementId: '' })
  const result = validateChatRequest(request)
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, 'VALIDATION_ERROR')
})

test('an empty question produces VALIDATION_ERROR', () => {
  const result = validateChatRequest(baseRequest({ question: '   ' }))
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, 'VALIDATION_ERROR')
})

test('a question exceeding the length limit produces VALIDATION_ERROR', () => {
  const result = validateChatRequest(baseRequest({ question: 'a'.repeat(MAX_QUESTION_LENGTH + 1) }))
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, 'VALIDATION_ERROR')
})

test('HTML-like markup in the question is rejected', () => {
  const result = validateChatRequest(baseRequest({ question: '<script>alert(1)</script>' }))
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, 'VALIDATION_ERROR')
})

test('an unsupported language produces UNSUPPORTED_LANGUAGE', () => {
  const result = validateChatRequest(baseRequest({ language: 'fr' }))
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, 'UNSUPPORTED_LANGUAGE')
})

test('missing agreementText produces VALIDATION_ERROR', () => {
  const result = validateChatRequest(baseRequest({ agreementText: '' }))
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, 'VALIDATION_ERROR')
})

test('an oversized agreementText produces PAYLOAD_TOO_LARGE', () => {
  const result = validateChatRequest(baseRequest({ agreementText: 'a'.repeat(MAX_AGREEMENT_TEXT_LENGTH + 1) }))
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, 'PAYLOAD_TOO_LARGE')
})

test('a history array beyond the maximum size produces VALIDATION_ERROR', () => {
  const history = Array.from({ length: MAX_HISTORY_MESSAGES + 1 }, () => ({ role: 'user', text: 'hi' }))
  const result = validateChatRequest(baseRequest({ history }))
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, 'VALIDATION_ERROR')
})

test('a history entry with an invalid role produces VALIDATION_ERROR', () => {
  const result = validateChatRequest(baseRequest({ history: [{ role: 'system', text: 'hi' }] }))
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, 'VALIDATION_ERROR')
})

test('a valid bounded history is preserved in order', () => {
  const history = [
    { role: 'user', text: 'Will I be charged automatically?' },
    { role: 'assistant', text: 'Yes, according to the agreement.' },
  ]
  const result = validateChatRequest(baseRequest({ history }))
  assert.equal(result.ok, true)
  if (result.ok) assert.deepEqual(result.value.history, history)
})
