export type CacheKeyParts = {
  agreementId: string
  contentHash: string
  analysisVersion: string
}

export function buildCacheKey(parts: CacheKeyParts): string {
  return `${parts.agreementId}:${parts.contentHash}:${parts.analysisVersion}`
}
