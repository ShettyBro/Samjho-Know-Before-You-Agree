export type RateLimiter = {
  allow(key: string, now?: number): boolean
  clear(): void
}

type Bucket = { count: number; windowStartedAt: number }

const DEFAULT_WINDOW_MS = 60000
const DEFAULT_MAX_ATTEMPTS = 8

export function createRateLimiter(windowMs: number = DEFAULT_WINDOW_MS, maxAttempts: number = DEFAULT_MAX_ATTEMPTS): RateLimiter {
  const buckets = new Map<string, Bucket>()

  return {
    allow(key: string, now: number = Date.now()): boolean {
      const existing = buckets.get(key)
      if (!existing || now - existing.windowStartedAt >= windowMs) {
        buckets.set(key, { count: 1, windowStartedAt: now })
        return true
      }
      if (existing.count >= maxAttempts) return false
      existing.count += 1
      return true
    },
    clear(): void {
      buckets.clear()
    },
  }
}
