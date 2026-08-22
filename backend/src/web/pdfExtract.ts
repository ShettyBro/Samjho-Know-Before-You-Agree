import { ApiError } from '../analysis/errors.js'

export const MAX_PDF_BYTES = 8 * 1024 * 1024

export function validatePdfUpload(file: { mimetype: string; originalname: string; size: number } | undefined): ApiError | undefined {
  if (!file) {
    return new ApiError('VALIDATION_ERROR', 400, 'A PDF file is required.')
  }
  if (file.mimetype !== 'application/pdf') {
    return new ApiError('VALIDATION_ERROR', 400, 'Only PDF files are supported.')
  }
  if (!file.originalname.toLowerCase().endsWith('.pdf')) {
    return new ApiError('VALIDATION_ERROR', 400, 'Only PDF files are supported.')
  }
  if (file.size > MAX_PDF_BYTES) {
    return new ApiError('PAYLOAD_TOO_LARGE', 413, 'PDF file is too large.')
  }
  return undefined
}

export async function extractPdfText(buffer: Buffer): Promise<{ ok: true; text: string } | { ok: false; error: ApiError }> {
  try {
    const { PDFParse } = await import('pdf-parse')
    const parser = new PDFParse({ data: new Uint8Array(buffer) })
    const result = await parser.getText()
    await parser.destroy()
    const text = result.text.trim()
    if (text.length === 0) {
      return { ok: false, error: new ApiError('EXTRACTION_FAILED', 422, 'No readable text was found in this PDF.') }
    }
    return { ok: true, text }
  } catch {
    return { ok: false, error: new ApiError('EXTRACTION_FAILED', 422, 'This PDF could not be read.') }
  }
}
