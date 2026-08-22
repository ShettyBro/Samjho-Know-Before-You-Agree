import { Router } from 'express'
import { ApiError } from '../analysis/errors.js'
import { requireAuth, type AuthenticatedRequest } from '../auth/middleware.js'
import { historyRepository } from '../history/instance.js'
import { validateSaveAgreementRequest } from '../history/requestValidation.js'
import {
  getHistoryResult,
  getSavedResult,
  listHistory,
  listSaved,
  saveAgreement,
  unsaveAgreement,
} from '../history/service.js'

export const historyRouter = Router()

historyRouter.get('/api/v1/history', requireAuth, async (req: AuthenticatedRequest, res) => {
  const items = await listHistory(req.userId!, historyRepository)
  res.status(200).json({ items })
})

historyRouter.get('/api/v1/history/:agreementId', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  const result = await getHistoryResult(req.userId!, req.params.agreementId, historyRepository)
  if (!result) {
    next(new ApiError('VALIDATION_ERROR', 404, 'No history entry was found for this agreement.'))
    return
  }
  res.status(200).json({ result })
})

historyRouter.get('/api/v1/agreements/saved', requireAuth, async (req: AuthenticatedRequest, res) => {
  const items = await listSaved(req.userId!, historyRepository)
  res.status(200).json({ items })
})

historyRouter.get('/api/v1/agreements/saved/:agreementId', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  const result = await getSavedResult(req.userId!, req.params.agreementId, historyRepository)
  if (!result) {
    next(new ApiError('VALIDATION_ERROR', 404, 'No saved agreement was found with this identity.'))
    return
  }
  res.status(200).json({ result })
})

historyRouter.post('/api/v1/agreements/saved', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  const validation = validateSaveAgreementRequest(req.body)
  if (!validation.ok) {
    next(validation.error)
    return
  }

  await saveAgreement({ userId: req.userId!, ...validation.value }, historyRepository)
  res.status(201).json({ ok: true })
})

historyRouter.delete('/api/v1/agreements/saved/:agreementId', requireAuth, async (req: AuthenticatedRequest, res) => {
  await unsaveAgreement(req.userId!, req.params.agreementId, historyRepository)
  res.status(200).json({ ok: true })
})
