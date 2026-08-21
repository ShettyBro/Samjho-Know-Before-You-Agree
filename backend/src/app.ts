import cors from 'cors'
import express from 'express'
import { env } from './config/env.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import { analyzeRouter } from './routes/analyze.js'
import { healthRouter } from './routes/health.js'

export function createApp() {
  const app = express()

  app.use(cors({ origin: env.corsOrigins }))
  app.use(express.json({ limit: '2mb' }))

  app.use(healthRouter)
  app.use(analyzeRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
