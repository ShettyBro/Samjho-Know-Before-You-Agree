import cors from 'cors'
import express from 'express'
import { env } from './config/env.js'
import { authRouter } from './routes/auth.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import { analyzeRouter } from './routes/analyze.js'
import { chatRouter } from './routes/chat.js'
import { healthRouter } from './routes/health.js'
import { prefetchRouter } from './routes/prefetch.js'
import { webAnalyzeRouter } from './routes/webAnalyze.js'

export function createApp() {
  const app = express()

  app.use(cors({ origin: env.corsOrigins, credentials: true }))
  app.use(express.json({ limit: '2mb' }))

  app.use(healthRouter)
  app.use(analyzeRouter)
  app.use(prefetchRouter)
  app.use(chatRouter)
  app.use(authRouter)
  app.use(webAnalyzeRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
