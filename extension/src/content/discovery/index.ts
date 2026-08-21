import { sendRequest } from '../../shared/rpc'
import type { ConsentCandidate } from '../../shared/discoveryTypes'
import { DiscoveryEngine } from './observer'

function reportCandidates(candidates: ConsentCandidate[]): void {
  sendRequest('content', { type: 'DISCOVERY_UPDATE', candidates }).then((response) => {
    console.log('[Samjho] discovery update sent', response)
  })
}

export function startDiscovery(): void {
  new DiscoveryEngine(reportCandidates).start()
}
