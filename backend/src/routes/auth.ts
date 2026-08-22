import { Router } from 'express'
import { ApiError } from '../analysis/errors.js'
import { clearSessionCookie, setSessionCookie } from '../auth/cookies.js'
import { userRepository } from '../auth/instance.js'
import { requireAuth, type AuthenticatedRequest } from '../auth/middleware.js'
import { createRateLimiter } from '../auth/rateLimiter.js'
import { loginUser, registerUser } from '../auth/service.js'
import { toPublicUser } from '../auth/types.js'

export const authRouter = Router()

const registerLimiter = createRateLimiter()
const loginLimiter = createRateLimiter()

authRouter.post('/api/v1/auth/register', async (req, res, next) => {
  const key = req.ip ?? 'unknown'
  if (!registerLimiter.allow(key)) {
    next(new ApiError('RATE_LIMITED', 429, 'Too many attempts. Please try again shortly.'))
    return
  }

  const result = await registerUser(req.body, userRepository)
  if (!result.ok) {
    console.log('[Samjho] register failed', { errorCode: result.error.code })
    next(result.error)
    return
  }

  setSessionCookie(res, result.value.token)
  console.log('[Samjho] register succeeded', { userId: result.value.user.id })
  res.status(201).json({ user: result.value.user })
})

authRouter.post('/api/v1/auth/login', async (req, res, next) => {
  const key = req.ip ?? 'unknown'
  if (!loginLimiter.allow(key)) {
    next(new ApiError('RATE_LIMITED', 429, 'Too many attempts. Please try again shortly.'))
    return
  }

  const result = await loginUser(req.body, userRepository)
  if (!result.ok) {
    console.log('[Samjho] login failed', { errorCode: result.error.code })
    next(result.error)
    return
  }

  setSessionCookie(res, result.value.token)
  console.log('[Samjho] login succeeded', { userId: result.value.user.id })
  res.status(200).json({ user: result.value.user })
})

authRouter.post('/api/v1/auth/logout', (_req, res) => {
  clearSessionCookie(res)
  res.status(200).json({ ok: true })
})

authRouter.get('/api/v1/auth/me', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  const user = req.userId ? await userRepository.findById(req.userId) : undefined
  if (!user) {
    next(new ApiError('UNAUTHENTICATED', 401, 'Please sign in to continue.'))
    return
  }
  res.status(200).json({ user: toPublicUser(user) })
})
