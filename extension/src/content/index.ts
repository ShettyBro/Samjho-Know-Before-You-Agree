import { sendRequest } from '../shared/rpc'
import { startDiscovery } from './discovery'
import { handleDiscoveredCandidates } from './extraction'
import { handleExtractionResults } from './identity'
import { initPopupFeature, updateLiveCandidates } from './popup/controller'

async function runContentSelfTest(): Promise<void> {
  const response = await sendRequest('content', { type: 'PING' })
  console.log('[Samjho] content -> service worker', response)
}

void runContentSelfTest()
initPopupFeature()
startDiscovery((live) => {
  updateLiveCandidates(live)
  void handleDiscoveredCandidates(live, handleExtractionResults)
})
