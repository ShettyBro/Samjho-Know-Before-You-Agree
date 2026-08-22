import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { validatePassword } from './passwordPolicy.js'

test('a password meeting the minimum length passes', () => {
  const result = validatePassword('correcthorse')
  assert.equal(result.ok, true)
})

test('a password shorter than the minimum length is rejected', () => {
  const result = validatePassword('short')
  assert.equal(result.ok, false)
  if (!result.ok) assert.match(result.message, /at least/i)
})

test('a missing password is rejected', () => {
  const result = validatePassword(undefined)
  assert.equal(result.ok, false)
})

test('a non-string password is rejected', () => {
  const result = validatePassword(12345678)
  assert.equal(result.ok, false)
})

test('an excessively long password is rejected', () => {
  const result = validatePassword('a'.repeat(200))
  assert.equal(result.ok, false)
})
