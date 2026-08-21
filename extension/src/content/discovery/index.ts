import { sendRequest } from '../../shared/rpc'
import type { ConsentCandidate } from '../../shared/discoveryTypes'
import { DiscoveryEngine } from './observer'
import type { LiveCandidate } from './types'

function reportCandidates(candidates: ConsentCandidate[]): void {
  sendRequest('content', { type: 'DISCOVERY_UPDATE', candidates }).then((response) => {
    console.log('[Samjho] discovery update sent', response)
  })
}

export function startDiscovery(onLiveCandidates?: (live: LiveCandidate[]) => void): void {
  new DiscoveryEngine((candidates, live) => {
    reportCandidates(candidates)
    onLiveCandidates?.(live)
  }).start()
}
