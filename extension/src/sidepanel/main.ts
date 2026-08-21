import { sendRawMessage, sendRequest } from '../shared/rpc'

function renderStatus(text: string): void {
  const el = document.getElementById('status')
  if (el) el.textContent = text
}

async function runSidepanelSelfTests(): Promise<void> {
  const status = await sendRequest('sidepanel', { type: 'GET_STATUS' })
  console.log('[Samjho] sidepanel -> service worker (status)', status)

  if (status.ok && status.payload.type === 'STATUS') {
    renderStatus(`Know Before You Agree. Backend reachable: ${status.payload.backend.reachable}`)
  } else {
    renderStatus('Know Before You Agree.')
  }

  const [first, second, third] = await Promise.all([
    sendRequest('sidepanel', { type: 'PING' }),
    sendRequest('sidepanel', { type: 'PING' }),
    sendRequest('sidepanel', { type: 'GET_STATUS' }),
  ])
  const requestIds = new Set([first.requestId, second.requestId, third.requestId])
  console.log('[Samjho] concurrent requests correlated correctly', {
    distinctRequestIds: requestIds.size === 3,
    first,
    second,
    third,
  })

  const unknownTypeResponse = await sendRawMessage({
    kind: 'request',
    requestId: crypto.randomUUID(),
    origin: 'sidepanel',
    payload: { type: 'NOT_A_REAL_TYPE' },
  })
  console.log('[Samjho] unknown message type handling', unknownTypeResponse)

  const malformedResponse = await sendRawMessage({ notEvenCloseToValid: true })
  console.log('[Samjho] malformed message handling', malformedResponse)
}

void runSidepanelSelfTests()
