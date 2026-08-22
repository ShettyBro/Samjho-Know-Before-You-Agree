import type { Request, Response } from 'express'
import { env } from '../config/env.js'

export function parseCookies(header: string | undefined): Record<string, string> {
  const result: Record<string, string> = {}
  if (!header) return result
  for (const part of header.split(';')) {
    const separatorIndex = part.indexOf('=')
    if (separatorIndex === -1) continue
    const key = part.slice(0, separatorIndex).trim()
    const value = part.slice(separatorIndex + 1).trim()
    if (key.length === 0) continue
    try {
      result[key] = decodeURIComponent(value)
    } catch {
      result[key] = value
    }
  }
  return result
}

export function readSessionCookie(req: Request): string | undefined {
  const cookies = parseCookies(req.headers.cookie)
  return cookies[env.auth.sessionCookieName]
}

export function setSessionCookie(res: Response, token: string): void {
  res.cookie(env.auth.sessionCookieName, token, {
    httpOnly: true,
    secure: env.auth.isProduction,
    sameSite: 'lax',
    maxAge: env.auth.sessionTtlMs,
    path: '/',
  })
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(env.auth.sessionCookieName, {
    httpOnly: true,
    secure: env.auth.isProduction,
    sameSite: 'lax',
    path: '/',
  })
}
