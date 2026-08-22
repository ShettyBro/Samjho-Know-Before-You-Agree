import { strict as assert } from 'node:assert'
import { after, before, test } from 'node:test'

const originalFetch = globalThis.fetch
const originalChrome = (globalThis as { chrome?: unknown }).chrome

before(() => {
  globalThis.fetch = (async () => {
    throw new Error('network unavailable in test environment')
  }) as typeof fetch
  ;(globalThis as { chrome?: unknown }).chrome = {
    runtime: { getManifest: () => ({ version: '0.0.1-test' }) },
  }
})

after(() => {
  globalThis.fetch = originalFetch
  ;(globalThis as { chrome?: unknown }).chrome = originalChrome
})

test('a PING request still receives a PONG response', async () => {
  const { handleIncomingMessage } = await import('./router.js')

  const response = await new Promise((resolve) => {
    handleIncomingMessage(
      { kind: 'request', requestId: 'req-1', origin: 'sidepanel', payload: { type: 'PING' } },
      {},
      resolve,
    )
  })

  assert.deepEqual(response, { kind: 'response', requestId: 'req-1', ok: true, payload: { type: 'PONG', respondedAt: (response as { payload: { respondedAt: number } }).payload.respondedAt } })
})

test('a GET_STATUS request still returns the extension version and backend reachability', async () => {
  const { handleIncomingMessage } = await import('./router.js')

  const response = await new Promise<{ ok: boolean; payload: { type: string; extensionVersion?: string; backend?: { reachable: boolean } } }>(
    (resolve) => {
      handleIncomingMessage(
        { kind: 'request', requestId: 'req-2', origin: 'sidepanel', payload: { type: 'GET_STATUS' } },
        {},
        resolve as never,
      )
    },
  )

  assert.equal(response.ok, true)
  assert.equal(response.payload.type, 'STATUS')
  assert.equal(response.payload.extensionVersion, '0.0.1-test')
  assert.equal(response.payload.backend?.reachable, false)
})

test('a malformed message is rejected without crashing the router', async () => {
  const { handleIncomingMessage } = await import('./router.js')

  const response = await new Promise((resolve) => {
    handleIncomingMessage({ notEvenClose: true }, {}, resolve)
  })

  assert.deepEqual((response as { payload: { code: string } }).payload.code, 'MALFORMED_MESSAGE')
})

function candidate(id: string) {
  return {
    candidateId: id,
    elementType: 'link' as const,
    matchedText: 'Conditions of Use',
    matchedSignals: [],
    associatedLinks: [],
    confidence: 'high' as const,
    confidenceScore: 6,
    source: 'initialScan' as const,
    firstSeenAt: Date.now(),
    lastSeenAt: Date.now(),
  }
}

function extraction(id: string) {
  return {
    candidateId: id,
    sourceType: 'samePage' as const,
    title: 'Conditions of Use',
    originalText: 'You agree to these conditions.',
    normalizedText: 'you agree to these conditions.',
    sourceReference: { strategy: 'link', headingPath: [], containerDescriptor: '' },
    confidence: 'high' as const,
    extractionStatus: 'READY' as const,
    extractionWarnings: [],
    extractedAt: Date.now(),
  }
}

function identity(id: string) {
  return {
    agreementId: `agr:${id}`,
    contentHash: `sha256:${id}`,
    canonicalSource: `https://example.com/${id}`,
    sourceType: 'samePage' as const,
    candidateId: id,
    normalizationVersion: 'v1',
    hashAlgorithm: 'sha256',
    hashInputLength: 30,
    identityWarnings: [],
    computedAt: Date.now(),
  }
}

function send(handleIncomingMessage: typeof import('./router.js').handleIncomingMessage, payload: unknown, sender: unknown) {
  return new Promise<{ ok: boolean; payload: Record<string, unknown> }>((resolve) => {
    handleIncomingMessage(
      { kind: 'request', requestId: 'req', origin: 'content', payload },
      sender as never,
      resolve as never,
    )
  })
}

test('GET_TAB_STATE reflects a populated tab exactly as background received it, keyed by numeric tab id', async () => {
  const { handleIncomingMessage } = await import('./router.js')
  const tabId = 1036063433

  await send(handleIncomingMessage, { type: 'DISCOVERY_UPDATE', candidates: [candidate('conditions'), candidate('privacy')] }, { tab: { id: tabId } })
  await send(handleIncomingMessage, { type: 'EXTRACTION_UPDATE', results: [extraction('conditions'), extraction('privacy')] }, { tab: { id: tabId } })
  await send(handleIncomingMessage, { type: 'IDENTITY_UPDATE', identities: [identity('conditions'), identity('privacy')] }, { tab: { id: tabId } })

  const response = await new Promise<{ ok: boolean; payload: Record<string, unknown> }>((resolve) => {
    handleIncomingMessage(
      { kind: 'request', requestId: 'req-tab-state', origin: 'sidepanel', payload: { type: 'GET_TAB_STATE', tabId } },
      {},
      resolve as never,
    )
  })

  assert.equal(response.ok, true)
  assert.equal(response.payload.hasContentScript, true)
  assert.equal((response.payload.candidates as unknown[]).length, 2)
  assert.equal((response.payload.extractions as unknown[]).length, 2)
  assert.equal((response.payload.identities as unknown[]).length, 2)
})

test('GET_TAB_STATE for a tab the background has never seen returns safe empty defaults, not an error', async () => {
  const { handleIncomingMessage } = await import('./router.js')

  const response = await new Promise<{ ok: boolean; payload: Record<string, unknown> }>((resolve) => {
    handleIncomingMessage(
      { kind: 'request', requestId: 'req-empty', origin: 'sidepanel', payload: { type: 'GET_TAB_STATE', tabId: 999999 } },
      {},
      resolve as never,
    )
  })

  assert.equal(response.ok, true)
  assert.equal(response.payload.hasContentScript, false)
  assert.deepEqual(response.payload.candidates, [])
  assert.deepEqual(response.payload.extractions, [])
  assert.deepEqual(response.payload.identities, [])
})

test('GET_TAB_STATE never returns one tab data for a different requested tab id', async () => {
  const { handleIncomingMessage } = await import('./router.js')
  const tabA = 111
  const tabB = 222

  await send(handleIncomingMessage, { type: 'DISCOVERY_UPDATE', candidates: [candidate('a')] }, { tab: { id: tabA } })
  await send(handleIncomingMessage, { type: 'EXTRACTION_UPDATE', results: [extraction('a')] }, { tab: { id: tabA } })
  await send(handleIncomingMessage, { type: 'IDENTITY_UPDATE', identities: [identity('a')] }, { tab: { id: tabA } })

  const response = await new Promise<{ ok: boolean; payload: Record<string, unknown> }>((resolve) => {
    handleIncomingMessage(
      { kind: 'request', requestId: 'req-mismatch', origin: 'sidepanel', payload: { type: 'GET_TAB_STATE', tabId: tabB } },
      {},
      resolve as never,
    )
  })

  assert.equal(response.payload.hasContentScript, false)
  assert.deepEqual(response.payload.extractions, [])
  assert.deepEqual(response.payload.identities, [])
})

test('GET_TAB_STATE reflects the latest dynamic update for a tab, not a permanently cached earlier snapshot', async () => {
  const { handleIncomingMessage } = await import('./router.js')
  const tabId = 555

  await send(handleIncomingMessage, { type: 'EXTRACTION_UPDATE', results: [extraction('a'), extraction('b')] }, { tab: { id: tabId } })
  await send(handleIncomingMessage, { type: 'EXTRACTION_UPDATE', results: [extraction('a'), extraction('b'), extraction('c'), extraction('d')] }, { tab: { id: tabId } })
  await send(handleIncomingMessage, { type: 'EXTRACTION_UPDATE', results: [extraction('a'), extraction('b')] }, { tab: { id: tabId } })

  const response = await new Promise<{ ok: boolean; payload: Record<string, unknown> }>((resolve) => {
    handleIncomingMessage(
      { kind: 'request', requestId: 'req-dynamic', origin: 'sidepanel', payload: { type: 'GET_TAB_STATE', tabId } },
      {},
      resolve as never,
    )
  })

  assert.equal((response.payload.extractions as unknown[]).length, 2)
})
