import 'dotenv/config'

function readCorsOrigins(): string[] {
  const raw = process.env.CORS_ORIGINS
  if (!raw) return ['http://localhost:5173']
  return raw.split(',').map((origin) => origin.trim()).filter(Boolean)
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  corsOrigins: readCorsOrigins(),
  analysisProvider: (process.env.ANALYSIS_PROVIDER === 'mock' ? 'mock' : 'gemini') as 'mock' | 'gemini',
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL ?? 'gemini-3.1-flash-lite',
    timeoutMs: Number(process.env.GEMINI_TIMEOUT_MS ?? 15000),
    retryAttempts: Number(process.env.GEMINI_RETRY_ATTEMPTS ?? 1),
  },
  cache: {
    ttlMs: Number(process.env.CACHE_TTL_MS ?? 600000),
    maxEntries: Number(process.env.CACHE_MAX_ENTRIES ?? 500),
  },
}
