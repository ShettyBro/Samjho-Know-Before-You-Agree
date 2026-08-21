import { Router } from 'express'
import { env } from '../config/env.js'
import { geminiProvider } from '../analysis/gemini/provider.js'
import { mockProvider } from '../analysis/mockProvider.js'
import { analyzeAgreement } from '../analysis/service.js'

export const analyzeRouter = Router()

const provider = env.analysisProvider === 'mock' ? mockProvider : geminiProvider

analyzeRouter.post('/api/v1/agreements/analyze', async (req, res, next) => {
  const startedAt = Date.now()
  const inputLength =
    typeof req.body === 'object' && req.body !== null && typeof req.body.normalizedText === 'string'
      ? req.body.normalizedText.length
      : 0

  const result = await analyzeAgreement(req.body, provider)
  const elapsedMs = Date.now() - startedAt

  if (!result.ok) {
    console.log('[Samjho] analysis request failed', {
      provider: provider.name,
      model: env.gemini.model,
      elapsedMs,
      inputLength,
      errorCode: result.error.code,
    })
    next(result.error)
    return
  }

  console.log('[Samjho] analysis request succeeded', {
    provider: provider.name,
    model: env.gemini.model,
    analysisVersion: result.value.analysisVersion,
    elapsedMs,
    inputLength,
  })
  res.status(200).json(result.value)
})
