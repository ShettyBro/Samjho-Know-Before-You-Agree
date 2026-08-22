import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import type { Request, Response } from 'express'
import { ApiError } from '../analysis/errors.js'
import { limitAiRequests } from './aiRateLimiter.js'

function fakeRequest(ip: string): Request {
  return { ip } as Request
}

test('a burst of requests from the same IP eventually gets rate limited', () => {
  const req = fakeRequest('203.0.113.5')
  let limited = false

  for (let i = 0; i < 30; i += 1) {
    limitAiRequests(req, {} as Response, (error?: unknown) => {
      if (error instanceof ApiError && error.code === 'RATE_LIMITED') limited = true
    })
  }

  assert.equal(limited, true)
})

test('requests from a different IP are not affected by another IP\'s rate limit', () => {
  const first = fakeRequest('203.0.113.10')
  for (let i = 0; i < 25; i += 1) {
    limitAiRequests(first, {} as Response, () => undefined)
  }

  const second = fakeRequest('203.0.113.11')
  let secondLimited = false
  limitAiRequests(second, {} as Response, (error?: unknown) => {
    if (error instanceof ApiError) secondLimited = true
  })

  assert.equal(secondLimited, false)
})
