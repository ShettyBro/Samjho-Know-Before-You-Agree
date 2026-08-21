import { ApiError } from './errors.js'
import { MAX_CONTENT_LENGTH, SUPPORTED_LANGUAGES, SUPPORTED_SOURCE_TYPES } from './limits.js'
import type { AnalysisRequest, SourceType, SupportedLanguage } from './types.js'
import { isRecord, isValidHttpUrl } from './textGuard.js'
import type { ValidationResult } from './validationResult.js'

function isSupportedSourceType(value: unknown): value is SourceType {
  return typeof value === 'string' && (SUPPORTED_SOURCE_TYPES as readonly string[]).includes(value)
}

function isSupportedLanguage(value: unknown): value is SupportedLanguage {
  return typeof value === 'string' && (SUPPORTED_LANGUAGES as readonly string[]).includes(value)
}

export function validateAnalysisRequest(raw: unknown): ValidationResult<AnalysisRequest> {
  if (!isRecord(raw)) {
    return { ok: false, error: new ApiError('VALIDATION_ERROR', 400, 'Request body must be a JSON object') }
  }

  const errors: string[] = []

  if (typeof raw.agreementId !== 'string' || raw.agreementId.length === 0) {
    errors.push('agreementId is required and must be a non-empty string')
  }
  if (typeof raw.contentHash !== 'string' || raw.contentHash.length === 0) {
    errors.push('contentHash is required and must be a non-empty string')
  }
  if (typeof raw.normalizedText !== 'string' || raw.normalizedText.length === 0) {
    errors.push('normalizedText is required and must be a non-empty string')
  }
  if (typeof raw.originalText !== 'string') {
    errors.push('originalText is required and must be a string')
  }
  if (typeof raw.analysisVersion !== 'string' || raw.analysisVersion.length === 0) {
    errors.push('analysisVersion is required and must be a non-empty string')
  }

  if (errors.length > 0) {
    return { ok: false, error: new ApiError('VALIDATION_ERROR', 400, 'Request failed validation', errors) }
  }

  if (!isSupportedSourceType(raw.sourceType)) {
    return {
      ok: false,
      error: new ApiError('INVALID_SOURCE', 400, `Unsupported source type: ${String(raw.sourceType)}`),
    }
  }

  if (!isSupportedLanguage(raw.language)) {
    return {
      ok: false,
      error: new ApiError('UNSUPPORTED_LANGUAGE', 400, `Unsupported language: ${String(raw.language)}`),
    }
  }

  const normalizedText = raw.normalizedText as string
  const originalText = raw.originalText as string
  if (normalizedText.length > MAX_CONTENT_LENGTH || originalText.length > MAX_CONTENT_LENGTH) {
    return {
      ok: false,
      error: new ApiError('PAYLOAD_TOO_LARGE', 413, 'Content exceeds the maximum allowed size'),
    }
  }

  if (raw.sourceUrl !== undefined && (typeof raw.sourceUrl !== 'string' || !isValidHttpUrl(raw.sourceUrl))) {
    return { ok: false, error: new ApiError('VALIDATION_ERROR', 400, 'sourceUrl must be a valid http(s) URL') }
  }

  if (raw.resolvedUrl !== undefined && (typeof raw.resolvedUrl !== 'string' || !isValidHttpUrl(raw.resolvedUrl))) {
    return { ok: false, error: new ApiError('VALIDATION_ERROR', 400, 'resolvedUrl must be a valid http(s) URL') }
  }

  return {
    ok: true,
    value: {
      agreementId: raw.agreementId as string,
      contentHash: raw.contentHash as string,
      sourceType: raw.sourceType,
      sourceUrl: raw.sourceUrl as string | undefined,
      resolvedUrl: raw.resolvedUrl as string | undefined,
      normalizedText,
      originalText,
      analysisVersion: raw.analysisVersion as string,
      language: raw.language,
    },
  }
}
