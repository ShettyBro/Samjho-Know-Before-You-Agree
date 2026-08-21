import { Router } from 'express'
import { mockProvider } from '../analysis/mockProvider.js'
import { analyzeAgreement } from '../analysis/service.js'

export const analyzeRouter = Router()

analyzeRouter.post('/api/v1/agreements/analyze', async (req, res, next) => {
  const result = await analyzeAgreement(req.body, mockProvider)
  if (!result.ok) {
    next(result.error)
    return
  }
  res.status(200).json(result.value)
})
