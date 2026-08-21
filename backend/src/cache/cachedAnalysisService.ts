import { ApiError } from '../analysis/errors.js'
import type { AgreementAnalysisProvider } from '../analysis/provider.js'
import { validateAnalysisRequest } from '../analysis/requestValidation.js'
import { validateAnalysisResult } from '../analysis/responseValidation.js'
import type { AnalysisRequest, AnalysisResult } from '../analysis/types.js'
import type { ValidationResult } from '../analysis/validationResult.js'
import type { AnalysisCache } from './AnalysisCache.js'
import { buildCacheKey } from './cacheKey.js'
import { InFlightRegistry } from './inFlightRegistry.js'

export type CacheLookupStatus = 'MISS' | 'PREFETCHING' | 'READY'

export type PrefetchOutcome = { cacheKey: string; status: CacheLookupStatus }
export type AnalyzeOutcome = { cacheKey: string; result: AnalysisResult }

export type CachedAnalysisService = {
  prefetch(rawRequest: unknown): ValidationResult<PrefetchOutcome>
  getOrAnalyze(rawRequest: unknown): Promise<ValidationResult<AnalyzeOutcome>>
  statusFor(cacheKey: string): CacheLookupStatus
  inFlightSize(): number
}

export function createCachedAnalysisService(deps: {
  cache: AnalysisCache
  provider: AgreementAnalysisProvider
  ttlMs: number
  now?: () => number
}): CachedAnalysisService {
  const inFlight = new InFlightRegistry<AnalysisResult>()
  const now = deps.now ?? Date.now

  function statusFor(cacheKey: string): CacheLookupStatus {
    if (deps.cache.has(cacheKey)) return 'READY'
    if (inFlight.has(cacheKey)) return 'PREFETCHING'
    return 'MISS'
  }

  function runAnalysis(request: AnalysisRequest, cacheKey: string): Promise<AnalysisResult> {
    return inFlight.register(cacheKey, async () => {
      const rawResult = await deps.provider.analyze(request)
      const validated = validateAnalysisResult(rawResult, {
        agreementId: request.agreementId,
        contentHash: request.contentHash,
        analysisVersion: request.analysisVersion,
      })
      if (!validated.ok) throw validated.error

      deps.cache.set({
        cacheKey,
        agreementId: request.agreementId,
        contentHash: request.contentHash,
        analysisVersion: request.analysisVersion,
        result: validated.value,
        createdAt: now(),
        expiresAt: now() + deps.ttlMs,
      })
      return validated.value
    })
  }

  return {
    prefetch(rawRequest: unknown): ValidationResult<PrefetchOutcome> {
      const requestValidation = validateAnalysisRequest(rawRequest)
      if (!requestValidation.ok) return requestValidation

      const request = requestValidation.value
      const cacheKey = buildCacheKey(request)
      const currentStatus = statusFor(cacheKey)

      if (currentStatus === 'MISS') {
        runAnalysis(request, cacheKey).catch(() => undefined)
        return { ok: true, value: { cacheKey, status: 'PREFETCHING' } }
      }

      return { ok: true, value: { cacheKey, status: currentStatus } }
    },

    async getOrAnalyze(rawRequest: unknown): Promise<ValidationResult<AnalyzeOutcome>> {
      const requestValidation = validateAnalysisRequest(rawRequest)
      if (!requestValidation.ok) return requestValidation

      const request = requestValidation.value
      const cacheKey = buildCacheKey(request)
      const cached = deps.cache.get(cacheKey)
      if (cached) return { ok: true, value: { cacheKey, result: cached.result } }

      try {
        const result = await runAnalysis(request, cacheKey)
        return { ok: true, value: { cacheKey, result } }
      } catch (error) {
        const apiError =
          error instanceof ApiError ? error : new ApiError('PROVIDER_ERROR', 502, 'The analysis provider failed to produce a result')
        return { ok: false, error: apiError }
      }
    },

    statusFor,
    inFlightSize: () => inFlight.size(),
  }
}
