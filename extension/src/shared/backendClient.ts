import type { BackendStatus } from './messages'

const BACKEND_BASE_URL = 'http://localhost:4000'

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
