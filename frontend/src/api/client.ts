import { isApiErrorPayload, type ApiErrorPayload } from './types.js'

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:4000'

export type ApiOutcome<T> = { ok: true; value: T } | { ok: false; error: ApiErrorPayload }

const GENERIC_FAILURE: ApiErrorPayload = {
  code: 'PROVIDER_ERROR',
  message: "Samjho couldn't complete that request right now.",
  details: [],
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  isValue: (value: unknown) => value is T,
): Promise<ApiOutcome<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: 'include',
      headers: init.body instanceof FormData ? init.headers : { 'Content-Type': 'application/json', ...init.headers },
    })

    const data: unknown = await response.json().catch(() => undefined)

    if (!response.ok) {
      if (isApiErrorPayload(data)) return { ok: false, error: data }
      return { ok: false, error: GENERIC_FAILURE }
    }

    if (!isValue(data)) return { ok: false, error: GENERIC_FAILURE }
    return { ok: true, value: data }
  } catch {
    return { ok: false, error: GENERIC_FAILURE }
  }
}
