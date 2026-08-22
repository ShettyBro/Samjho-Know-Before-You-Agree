import type { NextFunction, Request, Response } from 'express'
import { ApiError } from '../analysis/errors.js'
import { readSessionCookie } from './cookies.js'
import { verifySessionToken } from './token.js'

export type AuthenticatedRequest = Request & { userId?: string }

export function requireAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const token = readSessionCookie(req)
  const payload = token ? verifySessionToken(token) : undefined
  if (!payload) {
    next(new ApiError('UNAUTHENTICATED', 401, 'Please sign in to continue.'))
    return
  }
  req.userId = payload.userId
  next()
}

export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const token = readSessionCookie(req)
  const payload = token ? verifySessionToken(token) : undefined
  if (payload) req.userId = payload.userId
  next()
}
