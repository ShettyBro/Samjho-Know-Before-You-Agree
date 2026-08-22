import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { createInMemoryUserRepository } from './userRepository.js'

test('a new email has no existing user', async () => {
  const repository = createInMemoryUserRepository()
  const found = await repository.findByEmail('nobody@example.com')
  assert.equal(found, undefined)
})

test('a created user can be found by email and by id', async () => {
  const repository = createInMemoryUserRepository()
  const user = await repository.createUser({ email: 'user@example.com', passwordHash: 'hashed' })

  const byEmail = await repository.findByEmail('user@example.com')
  const byId = await repository.findById(user.id)

  assert.equal(byEmail?.id, user.id)
  assert.equal(byId?.email, 'user@example.com')
})

test('each created user receives a unique id', async () => {
  const repository = createInMemoryUserRepository()
  const userA = await repository.createUser({ email: 'a@example.com', passwordHash: 'hashed' })
  const userB = await repository.createUser({ email: 'b@example.com', passwordHash: 'hashed' })
  assert.notEqual(userA.id, userB.id)
})

test('created users carry createdAt and updatedAt timestamps', async () => {
  const repository = createInMemoryUserRepository()
  const user = await repository.createUser({ email: 'user@example.com', passwordHash: 'hashed' })
  assert.equal(typeof user.createdAt, 'string')
  assert.equal(typeof user.updatedAt, 'string')
})
