import { Router } from 'express'
import { answerChatQuestion } from '../chat/service.js'
import { limitAiRequests } from '../middleware/aiRateLimiter.js'

export const chatRouter = Router()

chatRouter.post('/api/v1/agreements/chat', limitAiRequests, async (req, res, next) => {
  const startedAt = Date.now()
  const result = await answerChatQuestion(req.body)
  const elapsedMs = Date.now() - startedAt

  if (!result.ok) {
    console.log('[Samjho] chat request failed', { elapsedMs, errorCode: result.error.code })
    next(result.error)
    return
  }

  console.log('[Samjho] chat request succeeded', {
    agreementId: result.value.agreementId,
    elapsedMs,
    notFound: result.value.notFound,
  })
  res.status(200).json(result.value)
})
