import type { ConsentCandidate } from './discoveryTypes'

export type Origin = 'content' | 'sidepanel'

export type PingRequestPayload = { type: 'PING' }
export type GetStatusRequestPayload = { type: 'GET_STATUS' }
export type DiscoveryUpdateRequestPayload = { type: 'DISCOVERY_UPDATE'; candidates: ConsentCandidate[] }

export type RequestPayload = PingRequestPayload | GetStatusRequestPayload | DiscoveryUpdateRequestPayload

export type PongResponsePayload = { type: 'PONG'; respondedAt: number }

export type BackendStatus = { reachable: true; service: string } | { reachable: false }

export type StatusResponsePayload = {
  type: 'STATUS'
  extensionVersion: string
  backend: BackendStatus
}

export type DiscoveryAckResponsePayload = { type: 'DISCOVERY_ACK'; receivedCount: number }

export type ErrorCode =
  | 'MALFORMED_MESSAGE'
  | 'UNKNOWN_MESSAGE'
  | 'TIMEOUT'
  | 'TARGET_UNAVAILABLE'
  | 'INTERNAL_ERROR'

export type ErrorResponsePayload = { type: 'ERROR'; code: ErrorCode; message: string }

export type ResponsePayload =
  | PongResponsePayload
  | StatusResponsePayload
  | DiscoveryAckResponsePayload
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
  return type === 'PING' || type === 'GET_STATUS' || type === 'DISCOVERY_UPDATE'
}

export function extractRequestId(value: unknown): string {
  if (isRecord(value) && typeof value.requestId === 'string' && value.requestId.length > 0) {
    return value.requestId
  }
  return 'unknown'
}
