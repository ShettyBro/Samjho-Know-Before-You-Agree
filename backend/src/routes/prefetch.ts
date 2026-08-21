import { Router } from 'express'
import { analysisCacheService } from '../cache/instance.js'

export const prefetchRouter = Router()

prefetchRouter.post('/api/v1/agreements/prefetch', (req, res, next) => {
  const result = analysisCacheService.prefetch(req.body)

  if (!result.ok) {
    console.log('[Samjho] prefetch request failed', { errorCode: result.error.code })
    next(result.error)
    return
  }

  console.log('[Samjho] prefetch request accepted', result.value)
  res.status(200).json(result.value)
})
