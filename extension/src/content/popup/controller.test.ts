import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { findTrackedCandidateId } from './controller'

test('findTrackedCandidateId matches the exact tracked element', () => {
  const element = {} as Element
  const tracked = new Map([['candidate-1', element]])
  assert.equal(findTrackedCandidateId(tracked, element as unknown as EventTarget), 'candidate-1')
})

test('findTrackedCandidateId matches a tracked ancestor via the parentElement chain', () => {
  const trackedElement = { parentElement: null } as unknown as Element
  const child = { parentElement: trackedElement }
  const grandchild = { parentElement: child }
  const tracked = new Map([['candidate-1', trackedElement]])
  assert.equal(findTrackedCandidateId(tracked, grandchild as unknown as EventTarget), 'candidate-1')
})

test('findTrackedCandidateId returns undefined when the click target is unrelated to any tracked element', () => {
  const trackedElement = { parentElement: null } as unknown as Element
  const unrelated = { parentElement: null }
  const tracked = new Map([['candidate-1', trackedElement]])
  assert.equal(findTrackedCandidateId(tracked, unrelated as unknown as EventTarget), undefined)
})
