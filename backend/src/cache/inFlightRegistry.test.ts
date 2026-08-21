import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { InFlightRegistry } from './inFlightRegistry.js'

test('concurrent registrations for the same key share exactly one underlying call', async () => {
  const registry = new InFlightRegistry<number>()
  let callCount = 0
  const factory = () => {
    callCount += 1
    return new Promise<number>((resolve) => setTimeout(() => resolve(42), 20))
  }

  const [a, b] = await Promise.all([registry.register('key', factory), registry.register('key', factory)])
  assert.equal(callCount, 1)
  assert.equal(a, 42)
  assert.equal(b, 42)
})

test('the entry is removed after it settles successfully', async () => {
  const registry = new InFlightRegistry<number>()
  await registry.register('key', async () => 1)
  assert.equal(registry.has('key'), false)
})

test('the entry is removed after it settles with a failure', async () => {
  const registry = new InFlightRegistry<number>()
  await assert.rejects(() => registry.register('key', async () => {
    throw new Error('boom')
  }))
  assert.equal(registry.has('key'), false)
})

test('different keys run independently and concurrently', async () => {
  const registry = new InFlightRegistry<string>()
  let concurrentCount = 0
  let maxConcurrent = 0
  const factory = (value: string) => async () => {
    concurrentCount += 1
    maxConcurrent = Math.max(maxConcurrent, concurrentCount)
    await new Promise((resolve) => setTimeout(resolve, 20))
    concurrentCount -= 1
    return value
  }

  const [a, b] = await Promise.all([registry.register('a', factory('a')), registry.register('b', factory('b'))])
  assert.equal(a, 'a')
  assert.equal(b, 'b')
  assert.equal(maxConcurrent, 2)
})
