import { sendRequest } from '../shared/rpc'
import { startDiscovery } from './discovery'

async function runContentSelfTest(): Promise<void> {
  const response = await sendRequest('content', { type: 'PING' })
  console.log('[Samjho] content -> service worker', response)
}

void runContentSelfTest()
startDiscovery()
