import type { NextFunction, Request, Response } from 'express'

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: 'Not Found', path: req.path })
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  const message = err instanceof Error ? err.message : 'Internal Server Error'
  console.error(err)
  res.status(500).json({ error: message })
}
