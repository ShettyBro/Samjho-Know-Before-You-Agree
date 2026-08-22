import { ApiError } from '../analysis/errors.js'
import { SUPPORTED_LANGUAGES } from '../analysis/limits.js'
import type { SupportedLanguage } from '../analysis/types.js'
import { containsHtmlLikeMarkup, isRecord } from '../analysis/textGuard.js'
import type { ValidationResult } from '../analysis/validationResult.js'
import {
  MAX_AGREEMENT_TEXT_LENGTH,
  MAX_HISTORY_MESSAGE_LENGTH,
  MAX_HISTORY_MESSAGES,
  MAX_QUESTION_LENGTH,
} from './limits.js'
import type { ChatMessage, ChatRequest } from './types.js'

function isSupportedLanguage(value: unknown): value is SupportedLanguage {
  return typeof value === 'string' && (SUPPORTED_LANGUAGES as readonly string[]).includes(value)
}

function validateHistory(raw: unknown, errors: string[]): ChatMessage[] {
  if (raw === undefined) return []
  if (!Array.isArray(raw)) {
    errors.push('history must be an array when present')
    return []
  }
  if (raw.length > MAX_HISTORY_MESSAGES) {
    errors.push(`history must contain at most ${MAX_HISTORY_MESSAGES} messages`)
    return []
  }

  const messages: ChatMessage[] = []
  raw.forEach((entry: unknown, index: number) => {
    if (!isRecord(entry)) {
      errors.push(`history[${index}] must be an object`)
      return
    }
    if (entry.role !== 'user' && entry.role !== 'assistant') {
      errors.push(`history[${index}].role must be "user" or "assistant"`)
      return
    }
    if (typeof entry.text !== 'string' || entry.text.length === 0 || entry.text.length > MAX_HISTORY_MESSAGE_LENGTH) {
      errors.push(`history[${index}].text must be a non-empty string within the length limit`)
      return
    }
    if (containsHtmlLikeMarkup(entry.text)) {
      errors.push(`history[${index}].text must not contain HTML-like markup`)
      return
    }
    messages.push({ role: entry.role, text: entry.text })
  })

  return messages
}

export function validateChatRequest(raw: unknown): ValidationResult<ChatRequest> {
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
  if (typeof raw.analysisVersion !== 'string' || raw.analysisVersion.length === 0) {
    errors.push('analysisVersion is required and must be a non-empty string')
  }
  if (typeof raw.question !== 'string' || raw.question.trim().length === 0 || raw.question.length > MAX_QUESTION_LENGTH) {
    errors.push('question is required, must be non-empty, and must be within the length limit')
  } else if (containsHtmlLikeMarkup(raw.question)) {
    errors.push('question must not contain HTML-like markup')
  }
  if (typeof raw.agreementText !== 'string' || raw.agreementText.trim().length === 0) {
    errors.push('agreementText is required and must be a non-empty string')
  }

  const history = validateHistory(raw.history, errors)

  if (errors.length > 0) {
    return { ok: false, error: new ApiError('VALIDATION_ERROR', 400, 'Request failed validation', errors) }
  }

  if (!isSupportedLanguage(raw.language)) {
    return { ok: false, error: new ApiError('UNSUPPORTED_LANGUAGE', 400, `Unsupported language: ${String(raw.language)}`) }
  }

  const agreementText = raw.agreementText as string
  if (agreementText.length > MAX_AGREEMENT_TEXT_LENGTH) {
    return { ok: false, error: new ApiError('PAYLOAD_TOO_LARGE', 413, 'Agreement text exceeds the maximum allowed size') }
  }

  return {
    ok: true,
    value: {
      agreementId: raw.agreementId as string,
      contentHash: raw.contentHash as string,
      analysisVersion: raw.analysisVersion as string,
      question: (raw.question as string).trim(),
      language: raw.language,
      agreementText,
      history,
    },
  }
}
