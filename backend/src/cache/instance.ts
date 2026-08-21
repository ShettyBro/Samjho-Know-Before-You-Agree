import { env } from '../config/env.js'
import { geminiProvider } from '../analysis/gemini/provider.js'
import { mockProvider } from '../analysis/mockProvider.js'
import { InMemoryAnalysisCache } from './AnalysisCache.js'
import { createCachedAnalysisService } from './cachedAnalysisService.js'

const provider = env.analysisProvider === 'mock' ? mockProvider : geminiProvider

export const analysisCacheService = createCachedAnalysisService({
  cache: new InMemoryAnalysisCache(env.cache.maxEntries),
  provider,
  ttlMs: env.cache.ttlMs,
})
