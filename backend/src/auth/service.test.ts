import { strict as assert } from 'node:assert'
import { test } from 'node:test'

process.env.AUTH_JWT_SECRET = 'test-only-secret-not-for-production'
const { registerUser, loginUser } = await import('./service.js')
const { createInMemoryUserRepository } = await import('./userRepository.js')

test('registering with a new email succeeds and returns a public user and a token', async () => {
  const repository = createInMemoryUserRepository()
  const result = await registerUser({ email: 'new@example.com', password: 'correcthorse' }, repository)
  assert.equal(result.ok, true)
  if (result.ok) {
    assert.equal(result.value.user.email, 'new@example.com')
    assert.equal('passwordHash' in result.value.user, false)
    assert.equal(typeof result.value.token, 'string')
  }
})

test('registering with an email that already exists is rejected without leaking a password hash', async () => {
  const repository = createInMemoryUserRepository()
  await registerUser({ email: 'dup@example.com', password: 'correcthorse' }, repository)
  const result = await registerUser({ email: 'dup@example.com', password: 'anotherpassword' }, repository)
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, 'EMAIL_ALREADY_REGISTERED')
})

test('a registered user is stored with a hashed password, never plaintext', async () => {
  const repository = createInMemoryUserRepository()
  await registerUser({ email: 'user@example.com', password: 'correcthorse' }, repository)
  const stored = await repository.findByEmail('user@example.com')
  assert.notEqual(stored?.passwordHash, 'correcthorse')
})

test('logging in with correct credentials succeeds', async () => {
  const repository = createInMemoryUserRepository()
  await registerUser({ email: 'user@example.com', password: 'correcthorse' }, repository)
  const result = await loginUser({ email: 'user@example.com', password: 'correcthorse' }, repository)
  assert.equal(result.ok, true)
  if (result.ok) assert.equal(result.value.user.email, 'user@example.com')
})

test('logging in with an unregistered email fails with a safe generic message', async () => {
  const repository = createInMemoryUserRepository()
  const result = await loginUser({ email: 'ghost@example.com', password: 'anything' }, repository)
  assert.equal(result.ok, false)
  if (!result.ok) {
    assert.equal(result.error.code, 'INVALID_CREDENTIALS')
    assert.equal(result.error.message, 'Email or password is incorrect.')
  }
})

test('logging in with the wrong password fails with the same safe generic message as an unknown email', async () => {
  const repository = createInMemoryUserRepository()
  await registerUser({ email: 'user@example.com', password: 'correcthorse' }, repository)
  const result = await loginUser({ email: 'user@example.com', password: 'wrongpassword' }, repository)
  assert.equal(result.ok, false)
  if (!result.ok) {
    assert.equal(result.error.code, 'INVALID_CREDENTIALS')
    assert.equal(result.error.message, 'Email or password is incorrect.')
  }
})

test('two different users remain isolated from one another', async () => {
  const repository = createInMemoryUserRepository()
  const first = await registerUser({ email: 'first@example.com', password: 'correcthorse' }, repository)
  const second = await registerUser({ email: 'second@example.com', password: 'anotherpassword' }, repository)
  assert.equal(first.ok, true)
  assert.equal(second.ok, true)
  if (first.ok && second.ok) {
    assert.notEqual(first.value.user.id, second.value.user.id)
  }
})
