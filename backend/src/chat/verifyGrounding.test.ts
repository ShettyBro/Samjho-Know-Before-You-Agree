import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { isGrounded } from './verifyGrounding.js'

test('a sourceText that appears verbatim in the agreement is grounded', () => {
  assert.equal(isGrounded('Your subscription renews automatically each month.', 'Your subscription renews automatically each month. You may cancel anytime.'), true)
})

test('a sourceText not present in the agreement is not grounded', () => {
  assert.equal(isGrounded('You must pay a $500 penalty.', 'Your subscription renews automatically each month.'), false)
})

test('an empty sourceText is never grounded', () => {
  assert.equal(isGrounded('', 'Your subscription renews automatically each month.'), false)
})

test('surrounding whitespace on the sourceText does not prevent grounding', () => {
  assert.equal(isGrounded('  Your subscription renews automatically each month.  ', 'Your subscription renews automatically each month.'), true)
})
