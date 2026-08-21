import { sendRequest } from '../shared/rpc'
import { startDiscovery } from './discovery'
import { handleDiscoveredCandidates } from './extraction'

async function runContentSelfTest(): Promise<void> {
  const response = await sendRequest('content', { type: 'PING' })
  console.log('[Samjho] content -> service worker', response)
}

void runContentSelfTest()
startDiscovery(handleDiscoveredCandidates)
