import type { NextFunction, Request, Response } from 'express'
import { ApiError } from '../analysis/errors.js'

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ code: 'VALIDATION_ERROR', message: 'Not Found', details: [req.path] })
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    res.status(err.status).json({ code: err.code, message: err.message, details: err.details })
    return
  }

  if (isPayloadTooLargeError(err)) {
    res.status(413).json({ code: 'PAYLOAD_TOO_LARGE', message: 'Request payload is too large', details: [] })
    return
  }

  if (err instanceof SyntaxError) {
    res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Request body is not valid JSON', details: [] })
    return
  }

  console.error(err)
  res.status(500).json({ code: 'INTERNAL_ERROR', message: 'An unexpected error occurred', details: [] })
}

function isPayloadTooLargeError(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'type' in err && (err as { type?: unknown }).type === 'entity.too.large'
}
