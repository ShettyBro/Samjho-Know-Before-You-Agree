import { strict as assert } from 'node:assert'
import { test } from 'node:test'

process.env.AUTH_JWT_SECRET = 'test-only-secret-not-for-production'
const { issueSessionToken, verifySessionToken } = await import('./token.js')

test('a token issued for a user id can be verified back to that same user id', () => {
  const token = issueSessionToken('user-123')
  assert.equal(typeof token, 'string')
  const payload = verifySessionToken(token as string)
  assert.equal(payload?.userId, 'user-123')
})

test('a malformed token fails verification rather than throwing', () => {
  const payload = verifySessionToken('not-a-real-token')
  assert.equal(payload, undefined)
})

test('a token signed with a different secret fails verification', async () => {
  const jwt = (await import('jsonwebtoken')).default
  const foreignToken = jwt.sign({ userId: 'user-456' }, 'a-different-secret', { expiresIn: '1h' })
  const payload = verifySessionToken(foreignToken)
  assert.equal(payload, undefined)
})

test('an expired token fails verification', async () => {
  const jwt = (await import('jsonwebtoken')).default
  const expiredToken = jwt.sign({ userId: 'user-789' }, 'test-only-secret-not-for-production', { expiresIn: -10 })
  const payload = verifySessionToken(expiredToken)
  assert.equal(payload, undefined)
})
