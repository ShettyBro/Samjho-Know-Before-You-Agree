import { strict as assert } from 'node:assert'
import { test } from 'node:test'

function installFakeChrome(sendMessage: (message: unknown, callback: (response: unknown) => void) => void): void {
  ;(globalThis as unknown as { chrome: unknown }).chrome = {
    runtime: {
      sendMessage,
      lastError: undefined as { message: string } | undefined,
    },
  }
}

test('sendRequest resolves safely instead of throwing when the extension context is invalidated', async () => {
  installFakeChrome(() => {
    throw new Error('Extension context invalidated.')
  })
  const { sendRequest } = await import('./rpc.js')

  const response = await sendRequest('content', { type: 'PING' })
  assert.equal(response.ok, false)
  assert.equal(response.payload.type, 'ERROR')
  if (response.payload.type === 'ERROR') assert.equal(response.payload.code, 'TARGET_UNAVAILABLE')
})

test('sendRequest resolves with TARGET_UNAVAILABLE when chrome.runtime.lastError is set', async () => {
  installFakeChrome((_message, callback) => {
    ;(globalThis as unknown as { chrome: { runtime: { lastError?: { message: string } } } }).chrome.runtime.lastError = {
      message: 'Could not establish connection.',
    }
    callback(undefined)
  })
  const { sendRequest } = await import('./rpc.js')

  const response = await sendRequest('content', { type: 'PING' })
  assert.equal(response.ok, false)
  assert.equal(response.payload.type, 'ERROR')
  if (response.payload.type === 'ERROR') assert.equal(response.payload.code, 'TARGET_UNAVAILABLE')
})

test('sendRequest resolves with the real response on a normal successful round trip', async () => {
  const fakeResponse = { kind: 'response', requestId: 'anything', ok: true, payload: { type: 'PONG', respondedAt: Date.now() } }
  installFakeChrome((_message, callback) => {
    callback(fakeResponse)
  })
  const { sendRequest } = await import('./rpc.js')

  const response = await sendRequest('content', { type: 'PING' })
  assert.deepEqual(response, fakeResponse)
})

test('sendRawMessage resolves with undefined instead of throwing when the extension context is invalidated', async () => {
  installFakeChrome(() => {
    throw new Error('Extension context invalidated.')
  })
  const { sendRawMessage } = await import('./rpc.js')

  const response = await sendRawMessage({ type: 'PING' })
  assert.equal(response, undefined)
})
