import { Router } from 'express'
import { analysisCacheService } from '../cache/instance.js'

export const analyzeRouter = Router()

analyzeRouter.post('/api/v1/agreements/analyze', async (req, res, next) => {
  const startedAt = Date.now()
  const inputLength =
    typeof req.body === 'object' && req.body !== null && typeof req.body.normalizedText === 'string'
      ? req.body.normalizedText.length
      : 0

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

  console.log('[Samjho] analysis request succeeded', {
    cacheKey: result.value.cacheKey,
    analysisVersion: result.value.result.analysisVersion,
    elapsedMs,
    inputLength,
  })
  res.status(200).json(result.value.result)
})
