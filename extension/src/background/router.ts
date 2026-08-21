import { checkBackendHealth } from '../shared/backendClient'
import {
  extractRequestId,
  isKnownRequestPayloadType,
  isSamjhoRequest,
  type SamjhoRequest,
  type SamjhoResponse,
} from '../shared/messages'

async function buildResponse(request: SamjhoRequest): Promise<SamjhoResponse> {
  const { requestId, payload } = request

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

export function handleIncomingMessage(
  raw: unknown,
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

  buildResponse(raw)
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
