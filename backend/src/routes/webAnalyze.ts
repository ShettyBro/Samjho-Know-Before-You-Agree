import { Router } from 'express'
import multer from 'multer'
import { analysisCacheService } from '../cache/instance.js'
import { normalizeWebText } from '../web/identity.js'
import { analyzeWebSubmission } from '../web/pipeline.js'
import { extractPdfText, MAX_PDF_BYTES, validatePdfUpload } from '../web/pdfExtract.js'

export const webAnalyzeRouter = Router()

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_PDF_BYTES } })

webAnalyzeRouter.post('/api/v1/agreements/web/text', async (req, res, next) => {
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

  console.log('[Samjho] web text analysis succeeded', { cacheKey: result.value.cacheKey, elapsedMs })
  res.status(200).json({ result: result.value.result, agreementText: normalizeWebText(text.trim()) })
})

webAnalyzeRouter.post('/api/v1/agreements/web/pdf', upload.single('file'), async (req, res, next) => {
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

  console.log('[Samjho] web pdf analysis succeeded', { cacheKey: result.value.cacheKey, elapsedMs })
  res.status(200).json({ result: result.value.result, agreementText: normalizeWebText(extraction.text) })
})
