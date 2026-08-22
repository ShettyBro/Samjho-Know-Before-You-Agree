import { Router } from 'express'
import multer from 'multer'
import { analysisCacheService } from '../cache/instance.js'
import { optionalAuth, type AuthenticatedRequest } from '../auth/middleware.js'
import { historyRepository } from '../history/instance.js'
import { recordHistory } from '../history/service.js'
import { limitAiRequests } from '../middleware/aiRateLimiter.js'
import { normalizeWebText } from '../web/identity.js'
import { analyzeWebSubmission } from '../web/pipeline.js'
import { extractPdfText, MAX_PDF_BYTES, validatePdfUpload } from '../web/pdfExtract.js'
import type { AnalysisResult } from '../analysis/types.js'

export const webAnalyzeRouter = Router()

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_PDF_BYTES } })
const TITLE_PREVIEW_LENGTH = 80

function deriveTitleFromText(text: string): string {
  const firstLine = text.split('\n')[0]?.trim() ?? ''
  const base = firstLine.length > 0 ? firstLine : text.trim()
  if (base.length === 0) return 'Pasted agreement'
  return base.length > TITLE_PREVIEW_LENGTH ? `${base.slice(0, TITLE_PREVIEW_LENGTH - 3)}...` : base
}

async function recordHistoryIfAuthenticated(userId: string | undefined, title: string, result: AnalysisResult): Promise<void> {
  if (!userId) return
  await recordHistory(
    {
      userId,
      agreementId: result.agreementId,
      contentHash: result.contentHash,
      analysisVersion: result.analysisVersion,
      title,
      structuredResult: result,
    },
    historyRepository,
  )
}

webAnalyzeRouter.post('/api/v1/agreements/web/text', limitAiRequests, optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  const startedAt = Date.now()
  const body = req.body as { text?: unknown; language?: unknown }
  const text = typeof body.text === 'string' ? body.text : ''

  const result = await analyzeWebSubmission({ text, sourceType: 'pastedText', language: body.language }, analysisCacheService)
  const elapsedMs = Date.now() - startedAt

  if (!result.ok) {
    console.log('[Samjho] web text analysis failed', { elapsedMs, errorCode: result.error.code })
    next(result.error)
    return
  }

  await recordHistoryIfAuthenticated(req.userId, deriveTitleFromText(text), result.value.result)

  console.log('[Samjho] web text analysis succeeded', { cacheKey: result.value.cacheKey, elapsedMs })
  res.status(200).json({ result: result.value.result, agreementText: normalizeWebText(text.trim()) })
})

webAnalyzeRouter.post('/api/v1/agreements/web/pdf', limitAiRequests, optionalAuth, upload.single('file'), async (req: AuthenticatedRequest, res, next) => {
  const startedAt = Date.now()
  const language = (req.body as { language?: unknown }).language

  const validationError = validatePdfUpload(req.file)
  if (validationError) {
    next(validationError)
    return
  }

  const extraction = await extractPdfText(req.file!.buffer)
  if (!extraction.ok) {
    console.log('[Samjho] web pdf extraction failed', { errorCode: extraction.error.code })
    next(extraction.error)
    return
  }

  const result = await analyzeWebSubmission({ text: extraction.text, sourceType: 'pdf', language }, analysisCacheService)
  const elapsedMs = Date.now() - startedAt

  if (!result.ok) {
    console.log('[Samjho] web pdf analysis failed', { elapsedMs, errorCode: result.error.code })
    next(result.error)
    return
  }

  await recordHistoryIfAuthenticated(req.userId, req.file?.originalname ?? deriveTitleFromText(extraction.text), result.value.result)

  console.log('[Samjho] web pdf analysis succeeded', { cacheKey: result.value.cacheKey, elapsedMs })
  res.status(200).json({ result: result.value.result, agreementText: normalizeWebText(extraction.text) })
})
