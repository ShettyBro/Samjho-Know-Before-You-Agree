import type { Origin, RequestPayload, SamjhoRequest, SamjhoResponse } from './messages'

const DEFAULT_TIMEOUT_MS = 4000

export function sendRequest(
  origin: Origin,
  payload: RequestPayload,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<SamjhoResponse> {
  const requestId = crypto.randomUUID()
  const message: SamjhoRequest = { kind: 'request', requestId, origin, payload }

  return new Promise((resolve) => {
    let settled = false

    const timer = setTimeout(() => {
      if (settled) return
      settled = true
      resolve({
        kind: 'response',
        requestId,
        ok: false,
        payload: { type: 'ERROR', code: 'TIMEOUT', message: 'Request timed out' },
      })
    }, timeoutMs)

    try {
      chrome.runtime.sendMessage(message, (response: SamjhoResponse | undefined) => {
        if (settled) return
        settled = true
        clearTimeout(timer)

        if (chrome.runtime.lastError || response === undefined) {
          resolve({
            kind: 'response',
            requestId,
            ok: false,
            payload: {
              type: 'ERROR',
              code: 'TARGET_UNAVAILABLE',
              message: chrome.runtime.lastError?.message ?? 'No response received',
            },
          })
          return
        }

        resolve(response)
      })
    } catch (error) {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolve({
        kind: 'response',
        requestId,
        ok: false,
        payload: {
          type: 'ERROR',
          code: 'TARGET_UNAVAILABLE',
          message: error instanceof Error ? error.message : 'Extension context is no longer available',
        },
      })
    }
  })
}

export function sendRawMessage(message: unknown, timeoutMs: number = DEFAULT_TIMEOUT_MS): Promise<unknown> {
  return new Promise((resolve) => {
    let settled = false

    const timer = setTimeout(() => {
      if (settled) return
      settled = true
      resolve(undefined)
    }, timeoutMs)

    try {
      chrome.runtime.sendMessage(message, (response: unknown) => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        void chrome.runtime.lastError
        resolve(response)
      })
    } catch {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolve(undefined)
    }
  })
}
