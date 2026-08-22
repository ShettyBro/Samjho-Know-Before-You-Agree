import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { validateChatModelResponse } from './responseValidation.js'

function validResponse(overrides: Record<string, unknown> = {}) {
  return {
    answer: 'Yes, the subscription renews automatically each month.',
    sourceText: 'Your subscription renews automatically each month.',
    sourceReference: { sectionTitle: '', sourceIndex: '0' },
    confidence: 'high',
    notFound: false,
    ...overrides,
  }
}

test('a valid chat model response passes validation', () => {
  const result = validateChatModelResponse(validResponse())
  assert.equal(result.ok, true)
})

test('an empty answer fails validation', () => {
  const result = validateChatModelResponse(validResponse({ answer: '' }))
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, 'ANALYSIS_SCHEMA_ERROR')
})

test('HTML-like markup in the answer fails validation', () => {
  const result = validateChatModelResponse(validResponse({ answer: '<b>Yes</b>' }))
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, 'ANALYSIS_SCHEMA_ERROR')
})

test('an invalid confidence value fails validation', () => {
  const result = validateChatModelResponse(validResponse({ confidence: 'certain' }))
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, 'ANALYSIS_SCHEMA_ERROR')
})

test('a missing sourceReference field fails validation', () => {
  const result = validateChatModelResponse(validResponse({ sourceReference: { sectionTitle: '' } }))
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, 'ANALYSIS_SCHEMA_ERROR')
})

test('a non-boolean notFound fails validation', () => {
  const result = validateChatModelResponse(validResponse({ notFound: 'false' }))
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, 'ANALYSIS_SCHEMA_ERROR')
})

test('a malformed (non-object) response fails validation', () => {
  const result = validateChatModelResponse('not an object')
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, 'ANALYSIS_SCHEMA_ERROR')
})
