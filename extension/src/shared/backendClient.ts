import type { AnalysisRequestPayload } from './analysisRequestTypes'
import type { BackendStatus } from './messages'

const BACKEND_BASE_URL = 'http://localhost:4000'

export type PrefetchResult = { cacheKey: string; status: string }

export async function checkBackendHealth(): Promise<BackendStatus> {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/health`)
    if (!response.ok) return { reachable: false }

    const data: unknown = await response.json()
    if (
      typeof data === 'object' &&
      data !== null &&
      'service' in data &&
      typeof (data as { service: unknown }).service === 'string'
    ) {
      return { reachable: true, service: (data as { service: string }).service }
    }
    return { reachable: false }
  } catch {
    return { reachable: false }
  }
}

export async function prefetchAnalysis(request: AnalysisRequestPayload): Promise<PrefetchResult | undefined> {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/api/v1/agreements/prefetch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
    if (!response.ok) return undefined

    const data: unknown = await response.json()
    if (
      typeof data === 'object' &&
      data !== null &&
      'cacheKey' in data &&
      'status' in data &&
      typeof (data as { cacheKey: unknown }).cacheKey === 'string' &&
      typeof (data as { status: unknown }).status === 'string'
    ) {
      return { cacheKey: (data as { cacheKey: string }).cacheKey, status: (data as { status: string }).status }
    }
    return undefined
  } catch {
    return undefined
  }
}
