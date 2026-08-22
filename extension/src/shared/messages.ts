import type { AnalysisRequestPayload, SupportedLanguage } from './analysisRequestTypes'
import type { AnalysisResultPayload } from './analysisResultTypes'
import type { ChatRequest, ChatResult } from './chatTypes'
import type { ConsentCandidate } from './discoveryTypes'
import type { AgreementExtractionResult } from './extractionTypes'
import type { AgreementIdentityResult } from './identityTypes'

export type Origin = 'content' | 'sidepanel'

export type PingRequestPayload = { type: 'PING' }
export type GetStatusRequestPayload = { type: 'GET_STATUS' }
export type DiscoveryUpdateRequestPayload = { type: 'DISCOVERY_UPDATE'; candidates: ConsentCandidate[] }
export type ExtractionUpdateRequestPayload = { type: 'EXTRACTION_UPDATE'; results: AgreementExtractionResult[] }
export type IdentityUpdateRequestPayload = { type: 'IDENTITY_UPDATE'; identities: AgreementIdentityResult[] }
export type PrefetchRequestPayload = { type: 'PREFETCH_REQUEST'; requests: AnalysisRequestPayload[] }
export type GetTabStateRequestPayload = { type: 'GET_TAB_STATE'; tabId: number }
export type AnalyzeRequestPayload = { type: 'ANALYZE_REQUEST'; request: AnalysisRequestPayload }
export type ChatRequestPayload = { type: 'CHAT_REQUEST'; request: ChatRequest }
export type OpenSidePanelRequestPayload = { type: 'OPEN_SIDE_PANEL_REQUEST'; language: SupportedLanguage }
export type ReinjectContentScriptRequestPayload = { type: 'REINJECT_CONTENT_SCRIPT'; tabId: number }

export type RequestPayload =
  | PingRequestPayload
  | GetStatusRequestPayload
  | DiscoveryUpdateRequestPayload
  | ExtractionUpdateRequestPayload
  | IdentityUpdateRequestPayload
  | PrefetchRequestPayload
  | GetTabStateRequestPayload
  | AnalyzeRequestPayload
  | ChatRequestPayload
  | OpenSidePanelRequestPayload
  | ReinjectContentScriptRequestPayload

export type PongResponsePayload = { type: 'PONG'; respondedAt: number }

export type BackendStatus = { reachable: true; service: string } | { reachable: false }

export type StatusResponsePayload = {
  type: 'STATUS'
  extensionVersion: string
  backend: BackendStatus
}

export type DiscoveryAckResponsePayload = { type: 'DISCOVERY_ACK'; receivedCount: number }
export type ExtractionAckResponsePayload = { type: 'EXTRACTION_ACK'; receivedCount: number }
export type IdentityAckResponsePayload = { type: 'IDENTITY_ACK'; receivedCount: number }
export type PrefetchStatusEntry = { agreementId: string; cacheKey?: string; status: string }
export type PrefetchAckResponsePayload = { type: 'PREFETCH_ACK'; results: PrefetchStatusEntry[] }
export type TabStateResponsePayload = {
  type: 'TAB_STATE'
  hasContentScript: boolean
  candidates: ConsentCandidate[]
  extractions: AgreementExtractionResult[]
  identities: AgreementIdentityResult[]
  prefetchStatus: PrefetchStatusEntry[]
  requestedLanguage: SupportedLanguage | null
}
export type AnalyzeResultResponsePayload = { type: 'ANALYZE_RESULT'; result: AnalysisResultPayload }
export type ChatResponsePayload = { type: 'CHAT_RESPONSE'; result: ChatResult }
export type OpenSidePanelAckResponsePayload = { type: 'OPEN_SIDE_PANEL_ACK'; accepted: boolean }
export type ReinjectContentScriptAckResponsePayload = { type: 'REINJECT_CONTENT_SCRIPT_ACK'; injected: boolean }

export type ErrorCode =
  | 'MALFORMED_MESSAGE'
  | 'UNKNOWN_MESSAGE'
  | 'TIMEOUT'
  | 'TARGET_UNAVAILABLE'
  | 'INTERNAL_ERROR'
  | 'ANALYSIS_FAILED'
  | 'CHAT_FAILED'

export type ErrorResponsePayload = { type: 'ERROR'; code: ErrorCode; message: string }

export type ResponsePayload =
  | PongResponsePayload
  | StatusResponsePayload
  | DiscoveryAckResponsePayload
  | ExtractionAckResponsePayload
  | IdentityAckResponsePayload
  | PrefetchAckResponsePayload
  | TabStateResponsePayload
  | AnalyzeResultResponsePayload
  | ChatResponsePayload
  | OpenSidePanelAckResponsePayload
  | ReinjectContentScriptAckResponsePayload
  | ErrorResponsePayload

export type SamjhoRequest = {
  kind: 'request'
  requestId: string
  origin: Origin
  payload: RequestPayload
}

export type SamjhoResponse = {
  kind: 'response'
  requestId: string
  ok: boolean
  payload: ResponsePayload
}

export type SamjhoMessage = SamjhoRequest | SamjhoResponse

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function isSamjhoRequest(value: unknown): value is SamjhoRequest {
  if (!isRecord(value)) return false
  if (value.kind !== 'request') return false
  if (typeof value.requestId !== 'string' || value.requestId.length === 0) return false
  if (value.origin !== 'content' && value.origin !== 'sidepanel') return false
  if (!isRecord(value.payload) || typeof value.payload.type !== 'string') return false
  return true
}

export function isKnownRequestPayloadType(type: string): type is RequestPayload['type'] {
  return (
    type === 'PING' ||
    type === 'GET_STATUS' ||
    type === 'DISCOVERY_UPDATE' ||
    type === 'EXTRACTION_UPDATE' ||
    type === 'IDENTITY_UPDATE' ||
    type === 'PREFETCH_REQUEST' ||
    type === 'GET_TAB_STATE' ||
    type === 'ANALYZE_REQUEST' ||
    type === 'CHAT_REQUEST' ||
    type === 'OPEN_SIDE_PANEL_REQUEST' ||
    type === 'REINJECT_CONTENT_SCRIPT'
  )
}

export function extractRequestId(value: unknown): string {
  if (isRecord(value) && typeof value.requestId === 'string' && value.requestId.length > 0) {
    return value.requestId
  }
  return 'unknown'
}
