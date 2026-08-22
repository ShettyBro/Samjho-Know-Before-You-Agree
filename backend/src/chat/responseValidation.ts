import { ApiError } from '../analysis/errors.js'
import { containsHtmlLikeMarkup, isRecord } from '../analysis/textGuard.js'
import type { ValidationResult } from '../analysis/validationResult.js'
import { MAX_ANSWER_LENGTH, MAX_SOURCE_TEXT_LENGTH } from './limits.js'
import type { ChatModelResponse } from './client.js'

const ALLOWED_CONFIDENCE = ['high', 'medium', 'low']

export function validateChatModelResponse(raw: unknown): ValidationResult<ChatModelResponse> {
  if (!isRecord(raw)) {
    return { ok: false, error: new ApiError('ANALYSIS_SCHEMA_ERROR', 502, 'Chat response must be an object') }
  }

  const errors: string[] = []

  if (typeof raw.answer !== 'string' || raw.answer.trim().length === 0 || raw.answer.length > MAX_ANSWER_LENGTH) {
    errors.push('answer must be a non-empty string within the length limit')
  } else if (containsHtmlLikeMarkup(raw.answer)) {
    errors.push('answer must not contain HTML-like markup')
  }

  if (typeof raw.sourceText !== 'string' || raw.sourceText.length > MAX_SOURCE_TEXT_LENGTH) {
    errors.push('sourceText must be a string within the length limit')
  }

  if (!isRecord(raw.sourceReference)) {
    errors.push('sourceReference must be an object')
  } else {
    if (typeof raw.sourceReference.sectionTitle !== 'string') errors.push('sourceReference.sectionTitle must be a string')
    if (typeof raw.sourceReference.sourceIndex !== 'string') errors.push('sourceReference.sourceIndex must be a string')
  }

  if (typeof raw.confidence !== 'string' || !ALLOWED_CONFIDENCE.includes(raw.confidence)) {
    errors.push('confidence must be high, medium, or low')
  }

  if (typeof raw.notFound !== 'boolean') {
    errors.push('notFound must be a boolean')
  }

  if (errors.length > 0) {
    return { ok: false, error: new ApiError('ANALYSIS_SCHEMA_ERROR', 502, 'Chat response failed schema validation', errors) }
  }

  return { ok: true, value: raw as unknown as ChatModelResponse }
}
