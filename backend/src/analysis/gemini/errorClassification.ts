export type GeminiErrorCategory =
  | 'CONFIGURATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'MODEL_UNAVAILABLE'
  | 'INVALID_REQUEST'
  | 'RATE_LIMITED'
  | 'QUOTA_EXHAUSTED'
  | 'TIMEOUT'
  | 'NETWORK_ERROR'
  | 'SCHEMA_ERROR'
  | 'PROVIDER_ERROR'

export type GeminiErrorClassification = {
  category: GeminiErrorCategory
  httpStatus?: number
  providerCode?: string
  requestId?: string
}

function extractProviderDetails(error: unknown): { providerStatus?: string; message?: string } {
  if (typeof error !== 'object' || error === null) return {}
  const message = (error as { message?: unknown }).message
  if (typeof message !== 'string') return {}
  try {
    const parsed = JSON.parse(message) as { error?: { status?: unknown } }
    const providerStatus = typeof parsed.error?.status === 'string' ? parsed.error.status : undefined
    return { providerStatus, message }
  } catch {
    return { message }
  }
}

export function classifyGeminiError(error: unknown): GeminiErrorClassification {
  if (typeof error !== 'object' || error === null) {
    return { category: 'PROVIDER_ERROR' }
  }

  const httpStatus = typeof (error as { status?: unknown }).status === 'number' ? (error as { status: number }).status : undefined
  const requestId = typeof (error as { requestId?: unknown }).requestId === 'string' ? (error as { requestId: string }).requestId : undefined
  const { providerStatus, message } = extractProviderDetails(error)

  if (providerStatus === 'RESOURCE_EXHAUSTED' || httpStatus === 429) {
    const isDailyQuota = typeof message === 'string' && /perday/i.test(message.replace(/\s+/g, ''))
    return {
      category: isDailyQuota ? 'QUOTA_EXHAUSTED' : 'RATE_LIMITED',
      httpStatus,
      providerCode: providerStatus,
      requestId,
    }
  }
  if (providerStatus === 'UNAUTHENTICATED' || httpStatus === 401) {
    return { category: 'AUTHENTICATION_ERROR', httpStatus, providerCode: providerStatus, requestId }
  }
  if (providerStatus === 'PERMISSION_DENIED' || httpStatus === 403) {
    return { category: 'AUTHENTICATION_ERROR', httpStatus, providerCode: providerStatus, requestId }
  }
  if (providerStatus === 'NOT_FOUND' || httpStatus === 404) {
    return { category: 'MODEL_UNAVAILABLE', httpStatus, providerCode: providerStatus, requestId }
  }
  if (providerStatus === 'INVALID_ARGUMENT' || httpStatus === 400) {
    return { category: 'INVALID_REQUEST', httpStatus, providerCode: providerStatus, requestId }
  }
  if (error instanceof Error && /timeout|timed out|aborted|deadline/i.test(error.message)) {
    return { category: 'TIMEOUT', httpStatus, providerCode: providerStatus, requestId }
  }
  if (error instanceof Error && /network|fetch failed|econnreset|enotfound|econnrefused/i.test(error.message)) {
    return { category: 'NETWORK_ERROR', httpStatus, providerCode: providerStatus, requestId }
  }
  if (httpStatus !== undefined && httpStatus >= 500) {
    return { category: 'PROVIDER_ERROR', httpStatus, providerCode: providerStatus, requestId }
  }

  return { category: 'PROVIDER_ERROR', httpStatus, providerCode: providerStatus, requestId }
}
