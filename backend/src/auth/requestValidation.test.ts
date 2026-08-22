import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { validateLoginRequest, validateRegisterRequest } from './requestValidation.js'

test('a valid registration request passes validation and normalizes the email', () => {
  const result = validateRegisterRequest({ email: '  User@Example.COM  ', password: 'correcthorse' })
  assert.equal(result.ok, true)
  if (result.ok) assert.equal(result.value.email, 'user@example.com')
})

test('registration with an invalid email is rejected', () => {
  const result = validateRegisterRequest({ email: 'not-an-email', password: 'correcthorse' })
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, 'VALIDATION_ERROR')
})

test('registration with a weak password is rejected', () => {
  const result = validateRegisterRequest({ email: 'user@example.com', password: 'short' })
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, 'VALIDATION_ERROR')
})

test('registration with a non-object body is rejected', () => {
  const result = validateRegisterRequest('not an object')
  assert.equal(result.ok, false)
})

test('a valid login request passes validation', () => {
  const result = validateLoginRequest({ email: 'user@example.com', password: 'anything' })
  assert.equal(result.ok, true)
})

test('login with an invalid email produces a safe INVALID_CREDENTIALS error, not a raw validation detail', () => {
  const result = validateLoginRequest({ email: 'not-an-email', password: 'anything' })
  assert.equal(result.ok, false)
  if (!result.ok) {
    assert.equal(result.error.code, 'INVALID_CREDENTIALS')
    assert.equal(result.error.message, 'Email or password is incorrect.')
  }
})

test('login with a missing password produces a safe INVALID_CREDENTIALS error', () => {
  const result = validateLoginRequest({ email: 'user@example.com' })
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, 'INVALID_CREDENTIALS')
})
