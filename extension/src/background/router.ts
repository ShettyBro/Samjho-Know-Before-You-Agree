import { analyzeAgreement, checkBackendHealth, prefetchAnalysis } from '../shared/backendClient'
import type { ConsentCandidate } from '../shared/discoveryTypes'
import type { AgreementExtractionResult } from '../shared/extractionTypes'
import type { AgreementIdentityResult } from '../shared/identityTypes'
import {
  extractRequestId,
  isKnownRequestPayloadType,
  isSamjhoRequest,
  type PrefetchStatusEntry,
  type SamjhoRequest,
  type SamjhoResponse,
} from '../shared/messages'

const latestCandidatesByTab = new Map<number, ConsentCandidate[]>()
const latestExtractionsByTab = new Map<number, AgreementExtractionResult[]>()
const latestIdentitiesByTab = new Map<number, AgreementIdentityResult[]>()
const latestPrefetchStatusByTab = new Map<number, PrefetchStatusEntry[]>()
const contentScriptSeenTabs = new Set<number>()

export function clearTabState(tabId: number): void {
  latestCandidatesByTab.delete(tabId)
  latestExtractionsByTab.delete(tabId)
  latestIdentitiesByTab.delete(tabId)
  latestPrefetchStatusByTab.delete(tabId)
  contentScriptSeenTabs.delete(tabId)
}

async function buildResponse(request: SamjhoRequest, tabId: number | undefined): Promise<SamjhoResponse> {
  const { requestId, payload, origin } = request

  if (origin === 'content' && tabId !== undefined) {
    contentScriptSeenTabs.add(tabId)
  }

  if (!isKnownRequestPayloadType(payload.type)) {
    return {
      kind: 'response',
      requestId,
      ok: false,
      payload: {
        type: 'ERROR',
        code: 'UNKNOWN_MESSAGE',
        message: `Unrecognized request type: ${payload.type}`,
      },
    }
  }

  if (payload.type === 'PING') {
    return {
      kind: 'response',
      requestId,
      ok: true,
      payload: { type: 'PONG', respondedAt: Date.now() },
    }
  }

  if (payload.type === 'GET_STATUS') {
    const backend = await checkBackendHealth()
    return {
      kind: 'response',
      requestId,
      ok: true,
      payload: {
        type: 'STATUS',
        extensionVersion: chrome.runtime.getManifest().version,
        backend,
      },
    }
  }

  if (payload.type === 'DISCOVERY_UPDATE') {
    if (tabId !== undefined) latestCandidatesByTab.set(tabId, payload.candidates)
    console.log('[Samjho] discovery update', { tabId, candidates: payload.candidates })
    return {
      kind: 'response',
      requestId,
      ok: true,
      payload: { type: 'DISCOVERY_ACK', receivedCount: payload.candidates.length },
    }
  }

  if (payload.type === 'EXTRACTION_UPDATE') {
    if (tabId !== undefined) latestExtractionsByTab.set(tabId, payload.results)
    console.log('[Samjho] extraction update', { tabId, results: payload.results })
    return {
      kind: 'response',
      requestId,
      ok: true,
      payload: { type: 'EXTRACTION_ACK', receivedCount: payload.results.length },
    }
  }

  if (payload.type === 'IDENTITY_UPDATE') {
    if (tabId !== undefined) latestIdentitiesByTab.set(tabId, payload.identities)
    console.log('[Samjho] identity update', { tabId, identities: payload.identities })
    return {
      kind: 'response',
      requestId,
      ok: true,
      payload: { type: 'IDENTITY_ACK', receivedCount: payload.identities.length },
    }
  }

  if (payload.type === 'PREFETCH_REQUEST') {
    const results = await Promise.all(
      payload.requests.map(async (request): Promise<PrefetchStatusEntry> => {
        const outcome = await prefetchAnalysis(request)
        if (!outcome) return { agreementId: request.agreementId, status: 'UNAVAILABLE' }
        return { agreementId: request.agreementId, cacheKey: outcome.cacheKey, status: outcome.status }
      }),
    )
    if (tabId !== undefined) latestPrefetchStatusByTab.set(tabId, results)
    console.log('[Samjho] prefetch requested', { tabId, results })
    return {
      kind: 'response',
      requestId,
      ok: true,
      payload: { type: 'PREFETCH_ACK', results },
    }
  }

  if (payload.type === 'GET_TAB_STATE') {
    const { tabId: requestedTabId } = payload
    return {
      kind: 'response',
      requestId,
      ok: true,
      payload: {
        type: 'TAB_STATE',
        hasContentScript: contentScriptSeenTabs.has(requestedTabId),
        candidates: latestCandidatesByTab.get(requestedTabId) ?? [],
        extractions: latestExtractionsByTab.get(requestedTabId) ?? [],
        identities: latestIdentitiesByTab.get(requestedTabId) ?? [],
        prefetchStatus: latestPrefetchStatusByTab.get(requestedTabId) ?? [],
      },
    }
  }

  const outcome = await analyzeAgreement(payload.request)
  if (!outcome.ok) {
    return {
      kind: 'response',
      requestId,
      ok: false,
      payload: { type: 'ERROR', code: 'ANALYSIS_FAILED', message: outcome.message },
    }
  }
  return {
    kind: 'response',
    requestId,
    ok: true,
    payload: { type: 'ANALYZE_RESULT', result: outcome.result },
  }
}

export function handleIncomingMessage(
  raw: unknown,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: SamjhoResponse) => void,
): boolean {
  if (!isSamjhoRequest(raw)) {
    sendResponse({
      kind: 'response',
      requestId: extractRequestId(raw),
      ok: false,
      payload: {
        type: 'ERROR',
        code: 'MALFORMED_MESSAGE',
        message: 'Request does not match the expected shape',
      },
    })
    return false
  }

  buildResponse(raw, sender.tab?.id)
    .then(sendResponse)
    .catch(() =>
      sendResponse({
        kind: 'response',
        requestId: raw.requestId,
        ok: false,
        payload: {
          type: 'ERROR',
          code: 'INTERNAL_ERROR',
          message: 'Unexpected error while handling request',
        },
      }),
    )

  return true
}
