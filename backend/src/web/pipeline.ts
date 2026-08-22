import { ApiError } from '../analysis/errors.js'
import { CURRENT_ANALYSIS_VERSION, MAX_CONTENT_LENGTH } from '../analysis/limits.js'
import type { SupportedLanguage } from '../analysis/types.js'
import type { AnalyzeOutcome, CachedAnalysisService } from '../cache/cachedAnalysisService.js'
import type { ValidationResult } from '../analysis/validationResult.js'
import { computeWebAgreementId, computeWebContentHash, normalizeWebText } from './identity.js'

export type WebSourceType = 'pastedText' | 'pdf'

const SUPPORTED_WEB_LANGUAGES = ['en', 'kn', 'hi'] as const

function isSupportedLanguage(value: unknown): value is SupportedLanguage {
  return typeof value === 'string' && (SUPPORTED_WEB_LANGUAGES as readonly string[]).includes(value)
}

export async function analyzeWebSubmission(
  input: { text: string; sourceType: WebSourceType; language: unknown },
  service: CachedAnalysisService,
): Promise<ValidationResult<AnalyzeOutcome>> {
  const trimmed = input.text.trim()
  if (trimmed.length === 0) {
    return { ok: false, error: new ApiError('VALIDATION_ERROR', 400, 'Agreement text is required.') }
  }
  if (trimmed.length > MAX_CONTENT_LENGTH) {
    return { ok: false, error: new ApiError('PAYLOAD_TOO_LARGE', 413, 'This agreement is too long to analyze.') }
  }
  if (!isSupportedLanguage(input.language)) {
    return { ok: false, error: new ApiError('UNSUPPORTED_LANGUAGE', 400, `Unsupported language: ${String(input.language)}`) }
  }

  const normalizedText = normalizeWebText(trimmed)
  if (normalizedText.length === 0) {
    return { ok: false, error: new ApiError('VALIDATION_ERROR', 400, 'Agreement text is required.') }
  }

  const contentHash = computeWebContentHash(normalizedText)
  const agreementId = computeWebAgreementId(input.sourceType, contentHash)

  return service.getOrAnalyze({
    agreementId,
    contentHash,
    sourceType: input.sourceType,
    normalizedText,
    originalText: trimmed,
    analysisVersion: CURRENT_ANALYSIS_VERSION,
    language: input.language,
  })
}
