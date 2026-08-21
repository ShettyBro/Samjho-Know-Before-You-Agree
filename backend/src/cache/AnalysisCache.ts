import type { AnalysisResult } from '../analysis/types.js'

export type CacheEntry = {
  cacheKey: string
  agreementId: string
  contentHash: string
  analysisVersion: string
  result: AnalysisResult
  createdAt: number
  expiresAt: number
}

export interface AnalysisCache {
  get(cacheKey: string): CacheEntry | undefined
  set(entry: CacheEntry): void
  delete(cacheKey: string): void
  has(cacheKey: string): boolean
  clear(): void
  size(): number
}

export class InMemoryAnalysisCache implements AnalysisCache {
  private readonly entries = new Map<string, CacheEntry>()
  private readonly now: () => number

  constructor(private readonly maxEntries: number, now: () => number = Date.now) {
    this.now = now
  }

  get(cacheKey: string): CacheEntry | undefined {
    const entry = this.entries.get(cacheKey)
    if (!entry) return undefined
    if (this.now() >= entry.expiresAt) {
      this.entries.delete(cacheKey)
      return undefined
    }
    this.entries.delete(cacheKey)
    this.entries.set(cacheKey, entry)
    return entry
  }

  set(entry: CacheEntry): void {
    this.entries.delete(entry.cacheKey)
    this.entries.set(entry.cacheKey, entry)
    while (this.entries.size > this.maxEntries) {
      const oldestKey = this.entries.keys().next().value
      if (oldestKey === undefined) break
      this.entries.delete(oldestKey)
    }
  }

  delete(cacheKey: string): void {
    this.entries.delete(cacheKey)
  }

  has(cacheKey: string): boolean {
    return this.get(cacheKey) !== undefined
  }

  clear(): void {
    this.entries.clear()
  }

  size(): number {
    return this.entries.size
  }
}
