import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export type SessionPayload = { userId: string }

export function issueSessionToken(userId: string): string | undefined {
  if (!env.auth.jwtSecret) return undefined
  return jwt.sign({ userId }, env.auth.jwtSecret, { expiresIn: Math.floor(env.auth.sessionTtlMs / 1000) })
}

export function verifySessionToken(token: string): SessionPayload | undefined {
  if (!env.auth.jwtSecret) return undefined
  try {
    const decoded = jwt.verify(token, env.auth.jwtSecret)
    if (typeof decoded === 'object' && decoded !== null && typeof (decoded as { userId?: unknown }).userId === 'string') {
      return { userId: (decoded as { userId: string }).userId }
    }
    return undefined
  } catch {
    return undefined
  }
}
