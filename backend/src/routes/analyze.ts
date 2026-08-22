import { Router } from 'express'
import { analysisCacheService } from '../cache/instance.js'
import { optionalAuth, type AuthenticatedRequest } from '../auth/middleware.js'
import { historyRepository } from '../history/instance.js'
import { recordHistory } from '../history/service.js'

export const analyzeRouter = Router()
const TITLE_PREVIEW_LENGTH = 80

function deriveTitleFromText(text: string): string {
  const firstLine = text.split('\n')[0]?.trim() ?? ''
  const base = firstLine.length > 0 ? firstLine : text.trim()
  if (base.length === 0) return 'Agreement'
  return base.length > TITLE_PREVIEW_LENGTH ? `${base.slice(0, TITLE_PREVIEW_LENGTH - 3)}...` : base
}

analyzeRouter.post('/api/v1/agreements/analyze', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  const startedAt = Date.now()
  const body = req.body as { normalizedText?: unknown; sourceUrl?: unknown; resolvedUrl?: unknown }
  const inputLength = typeof body.normalizedText === 'string' ? body.normalizedText.length : 0

  const result = await analysisCacheService.getOrAnalyze(req.body)
  const elapsedMs = Date.now() - startedAt

  if (!result.ok) {
    console.log('[Samjho] analysis request failed', {
      elapsedMs,
      inputLength,
      errorCode: result.error.code,
    })
    next(result.error)
    return
  }

  if (req.userId) {
    const sourceUrl = typeof body.resolvedUrl === 'string' ? body.resolvedUrl : typeof body.sourceUrl === 'string' ? body.sourceUrl : undefined
    await recordHistory(
      {
        userId: req.userId,
        agreementId: result.value.result.agreementId,
        contentHash: result.value.result.contentHash,
        analysisVersion: result.value.result.analysisVersion,
        title: typeof body.normalizedText === 'string' ? deriveTitleFromText(body.normalizedText) : 'Agreement',
        sourceUrl,
        structuredResult: result.value.result,
      },
      historyRepository,
    )
  }

  console.log('[Samjho] analysis request succeeded', {
    cacheKey: result.value.cacheKey,
    analysisVersion: result.value.result.analysisVersion,
    elapsedMs,
    inputLength,
  })
  res.status(200).json(result.value.result)
})
