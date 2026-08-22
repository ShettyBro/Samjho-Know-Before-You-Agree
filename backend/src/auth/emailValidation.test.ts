import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { isValidEmail, normalizeEmail } from './emailValidation.js'

test('a well-formed email passes validation', () => {
  assert.equal(isValidEmail('user@example.com'), true)
})

test('an email without an @ fails validation', () => {
  assert.equal(isValidEmail('userexample.com'), false)
})

test('an email without a domain dot fails validation', () => {
  assert.equal(isValidEmail('user@examplecom'), false)
})

test('a non-string value fails validation', () => {
  assert.equal(isValidEmail(12345), false)
  assert.equal(isValidEmail(undefined), false)
  assert.equal(isValidEmail(null), false)
})

test('an excessively long email fails validation', () => {
  const longLocalPart = 'a'.repeat(260)
  assert.equal(isValidEmail(`${longLocalPart}@example.com`), false)
})

test('normalizeEmail trims whitespace and lowercases the address', () => {
  assert.equal(normalizeEmail('  User@Example.COM  '), 'user@example.com')
})
