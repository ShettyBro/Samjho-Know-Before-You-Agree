import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { hashPassword, verifyPassword } from './passwordHash.js'

test('a hashed password never equals the original plaintext', async () => {
  const hash = await hashPassword('correcthorsebattery')
  assert.notEqual(hash, 'correcthorsebattery')
  assert.ok(hash.length > 0)
})

test('verifyPassword returns true for the correct password against its hash', async () => {
  const hash = await hashPassword('correcthorsebattery')
  const matches = await verifyPassword('correcthorsebattery', hash)
  assert.equal(matches, true)
})

test('verifyPassword returns false for an incorrect password', async () => {
  const hash = await hashPassword('correcthorsebattery')
  const matches = await verifyPassword('wrongpassword', hash)
  assert.equal(matches, false)
})

test('hashing the same password twice produces different hashes due to salting', async () => {
  const hashA = await hashPassword('samepassword')
  const hashB = await hashPassword('samepassword')
  assert.notEqual(hashA, hashB)
})
