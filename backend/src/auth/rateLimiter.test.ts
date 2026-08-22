import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { createRateLimiter } from './rateLimiter.js'

test('requests under the limit within the window are all allowed', () => {
  const limiter = createRateLimiter(60000, 3)
  assert.equal(limiter.allow('ip-a', 1000), true)
  assert.equal(limiter.allow('ip-a', 1000), true)
  assert.equal(limiter.allow('ip-a', 1000), true)
})

test('a request beyond the limit within the same window is refused', () => {
  const limiter = createRateLimiter(60000, 3)
  limiter.allow('ip-a', 1000)
  limiter.allow('ip-a', 1000)
  limiter.allow('ip-a', 1000)
  assert.equal(limiter.allow('ip-a', 1000), false)
})

test('different keys are tracked independently', () => {
  const limiter = createRateLimiter(60000, 1)
  assert.equal(limiter.allow('ip-a', 1000), true)
  assert.equal(limiter.allow('ip-b', 1000), true)
})

test('the limit resets once the window has elapsed', () => {
  const limiter = createRateLimiter(1000, 1)
  assert.equal(limiter.allow('ip-a', 1000), true)
  assert.equal(limiter.allow('ip-a', 1500), false)
  assert.equal(limiter.allow('ip-a', 2100), true)
})

test('clear removes all tracked buckets', () => {
  const limiter = createRateLimiter(60000, 1)
  limiter.allow('ip-a', 1000)
  assert.equal(limiter.allow('ip-a', 1000), false)
  limiter.clear()
  assert.equal(limiter.allow('ip-a', 1000), true)
})
