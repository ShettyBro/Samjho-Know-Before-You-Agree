import { ApiError } from './errors.js'
import {
  ALLOWED_CATEGORIES,
  ALLOWED_IMPORTANCE_LEVELS,
  MAX_ATTENTION_ITEMS,
  MAX_LIMITATIONS,
  MAX_SECTION_SUMMARY_POINTS,
  MAX_SUMMARY_POINTS,
  MAX_TEXT_FIELD_LENGTH,
  SUPPORTED_SOURCE_TYPES,
} from './limits.js'
import { containsHtmlLikeMarkup, isRecord, isValidHttpUrl } from './textGuard.js'
import type { AnalysisResult, SourceReference } from './types.js'
import type { ValidationResult } from './validationResult.js'

type ExpectedContext = { agreementId: string; contentHash: string; analysisVersion: string }

function fail(message: string, details: string[]): ValidationResult<never> {
  return { ok: false, error: new ApiError('ANALYSIS_SCHEMA_ERROR', 502, message, details) }
}

function validateSourceReference(raw: unknown, path: string, errors: string[]): SourceReference | undefined {
  if (!isRecord(raw)) {
    errors.push(`${path} must be an object`)
    return undefined
  }
  if (!Array.isArray(raw.headingPath) || raw.headingPath.some((entry) => typeof entry !== 'string')) {
    errors.push(`${path}.headingPath must be an array of strings`)
  }
  if (typeof raw.containerDescriptor !== 'string') {
    errors.push(`${path}.containerDescriptor must be a string`)
  }
  if (typeof raw.sourceIndex !== 'number' || raw.sourceIndex < 0) {
    errors.push(`${path}.sourceIndex must be a non-negative number`)
  }
  if (raw.sourceUrl !== undefined && (typeof raw.sourceUrl !== 'string' || !isValidHttpUrl(raw.sourceUrl))) {
    errors.push(`${path}.sourceUrl must be a valid http(s) URL when present`)
  }
  if (typeof raw.sourceType !== 'string' || !(SUPPORTED_SOURCE_TYPES as readonly string[]).includes(raw.sourceType)) {
    errors.push(`${path}.sourceType must be a supported source type`)
  }
  return raw as unknown as SourceReference
}

function validateAttentionItem(raw: unknown, index: number, errors: string[]): void {
  const path = `attentionItems[${index}]`
  if (!isRecord(raw)) {
    errors.push(`${path} must be an object`)
    return
  }
  if (typeof raw.id !== 'string' || raw.id.length === 0) errors.push(`${path}.id is required`)
  if (typeof raw.category !== 'string' || !(ALLOWED_CATEGORIES as readonly string[]).includes(raw.category)) {
    errors.push(`${path}.category must be an allowed category`)
  }
  if (typeof raw.importance !== 'string' || !(ALLOWED_IMPORTANCE_LEVELS as readonly string[]).includes(raw.importance)) {
    errors.push(`${path}.importance must be high, medium, or low`)
  }
  if (typeof raw.confidence !== 'string' || !(ALLOWED_IMPORTANCE_LEVELS as readonly string[]).includes(raw.confidence)) {
    errors.push(`${path}.confidence must be high, medium, or low`)
  }
  if (typeof raw.title !== 'string' || raw.title.length === 0 || raw.title.length > MAX_TEXT_FIELD_LENGTH) {
    errors.push(`${path}.title must be a non-empty string within the length limit`)
  } else if (containsHtmlLikeMarkup(raw.title)) {
    errors.push(`${path}.title must not contain HTML-like markup`)
  }
  if (
    typeof raw.explanation !== 'string' ||
    raw.explanation.length === 0 ||
    raw.explanation.length > MAX_TEXT_FIELD_LENGTH
  ) {
    errors.push(`${path}.explanation must be a non-empty string within the length limit`)
  } else if (containsHtmlLikeMarkup(raw.explanation)) {
    errors.push(`${path}.explanation must not contain HTML-like markup`)
  }
  if (typeof raw.sourceText !== 'string' || raw.sourceText.length === 0) {
    errors.push(`${path}.sourceText is required for a source-linked finding`)
  }
  validateSourceReference(raw.sourceReference, `${path}.sourceReference`, errors)
}

function validateSection(raw: unknown, path: string, errors: string[]): void {
  if (!isRecord(raw)) {
    errors.push(`${path} must be an object`)
    return
  }
  if (typeof raw.available !== 'boolean') errors.push(`${path}.available must be a boolean`)
  if (
    !Array.isArray(raw.summary) ||
    raw.summary.length > MAX_SECTION_SUMMARY_POINTS ||
    raw.summary.some((entry) => typeof entry !== 'string' || containsHtmlLikeMarkup(entry))
  ) {
    errors.push(`${path}.summary must be an array of plain-text strings within the limit`)
  }
  if (!Array.isArray(raw.relatedAttentionItemIds) || raw.relatedAttentionItemIds.some((id) => typeof id !== 'string')) {
    errors.push(`${path}.relatedAttentionItemIds must be an array of strings`)
  }
}

export function validateAnalysisResult(raw: unknown, context: ExpectedContext): ValidationResult<AnalysisResult> {
  if (!isRecord(raw)) return fail('Provider response must be an object', ['response must be an object'])

  const errors: string[] = []

  if (raw.agreementId !== context.agreementId) errors.push('agreementId does not match the request')
  if (raw.contentHash !== context.contentHash) errors.push('contentHash does not match the request')
  if (raw.analysisVersion !== context.analysisVersion) errors.push('analysisVersion does not match the request')

  if (
    !Array.isArray(raw.summary) ||
    raw.summary.length === 0 ||
    raw.summary.length > MAX_SUMMARY_POINTS ||
    raw.summary.some((entry) => typeof entry !== 'string' || containsHtmlLikeMarkup(entry))
  ) {
    errors.push('summary must be a non-empty array of plain-text strings within the limit')
  }

  if (typeof raw.disclaimer !== 'string' || raw.disclaimer.length === 0 || containsHtmlLikeMarkup(raw.disclaimer)) {
    errors.push('disclaimer is required and must be plain text')
  }

  if (typeof raw.generatedAt !== 'string' || Number.isNaN(Date.parse(raw.generatedAt))) {
    errors.push('generatedAt must be a valid ISO timestamp string')
  }

  if (
    !Array.isArray(raw.limitations) ||
    raw.limitations.length > MAX_LIMITATIONS ||
    raw.limitations.some((entry) => typeof entry !== 'string' || containsHtmlLikeMarkup(entry))
  ) {
    errors.push('limitations must be an array of plain-text strings within the limit')
  }

  if (!isRecord(raw.providerMetadata)) {
    errors.push('providerMetadata must be an object')
  } else {
    const metadata = raw.providerMetadata
    if (typeof metadata.provider !== 'string' || metadata.provider.length === 0) errors.push('providerMetadata.provider is required')
    if (typeof metadata.model !== 'string' || metadata.model.length === 0) errors.push('providerMetadata.model is required')
    if (typeof metadata.generatedAt !== 'string' || Number.isNaN(Date.parse(metadata.generatedAt))) {
      errors.push('providerMetadata.generatedAt must be a valid ISO timestamp string')
    }
    if (typeof metadata.inputHash !== 'string' || metadata.inputHash.length === 0) errors.push('providerMetadata.inputHash is required')
    if (typeof metadata.schemaVersion !== 'string' || metadata.schemaVersion.length === 0) {
      errors.push('providerMetadata.schemaVersion is required')
    }
  }

  if (!Array.isArray(raw.attentionItems)) {
    errors.push('attentionItems must be an array')
  } else if (raw.attentionItems.length > MAX_ATTENTION_ITEMS) {
    errors.push('attentionItems exceeds the maximum allowed count')
  } else {
    raw.attentionItems.forEach((item: unknown, index: number) => validateAttentionItem(item, index, errors))
  }

  for (const section of ['obligations', 'charges', 'renewals', 'cancellation', 'dataSharing', 'disputeResolution']) {
    validateSection((raw as Record<string, unknown>)[section], section, errors)
  }

  if (errors.length > 0) return fail('Provider response failed schema validation', errors)

  return { ok: true, value: raw as unknown as AnalysisResult }
}
