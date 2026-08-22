import type { NextFunction, Request, Response } from 'express'
import { createRateLimiter } from '../auth/rateLimiter.js'
import { ApiError } from '../analysis/errors.js'

const WINDOW_MS = 60000
const MAX_REQUESTS_PER_WINDOW = 20

const aiRequestLimiter = createRateLimiter(WINDOW_MS, MAX_REQUESTS_PER_WINDOW)

export function limitAiRequests(req: Request, _res: Response, next: NextFunction): void {
  const key = req.ip ?? 'unknown'
  if (!aiRequestLimiter.allow(key)) {
    next(new ApiError('RATE_LIMITED', 429, 'Too many requests. Please try again shortly.'))
    return
  }
  next()
}
