import { ApiError } from '../analysis/errors.js'
import { validateAnalysisResult } from '../analysis/responseValidation.js'
import { isRecord, isValidHttpUrl } from '../analysis/textGuard.js'
import type { AnalysisResult } from '../analysis/types.js'
import type { ValidationResult } from '../analysis/validationResult.js'

const MAX_TITLE_LENGTH = 300

export type SaveAgreementRequestBody = {
  agreementId: string
  contentHash: string
  analysisVersion: string
  title: string
  sourceUrl?: string
  structuredResult: AnalysisResult
}

export function validateSaveAgreementRequest(raw: unknown): ValidationResult<SaveAgreementRequestBody> {
  if (!isRecord(raw)) {
    return { ok: false, error: new ApiError('VALIDATION_ERROR', 400, 'A save request body is required.') }
  }

  const errors: string[] = []

  if (typeof raw.agreementId !== 'string' || raw.agreementId.length === 0) errors.push('agreementId is required')
  if (typeof raw.contentHash !== 'string' || raw.contentHash.length === 0) errors.push('contentHash is required')
  if (typeof raw.analysisVersion !== 'string' || raw.analysisVersion.length === 0) errors.push('analysisVersion is required')
  if (typeof raw.title !== 'string' || raw.title.length === 0 || raw.title.length > MAX_TITLE_LENGTH) {
    errors.push('title is required and must be within the length limit')
  }
  if (raw.sourceUrl !== undefined && (typeof raw.sourceUrl !== 'string' || !isValidHttpUrl(raw.sourceUrl))) {
    errors.push('sourceUrl must be a valid http(s) URL when present')
  }

  if (errors.length > 0) {
    return { ok: false, error: new ApiError('VALIDATION_ERROR', 400, 'Save request failed validation.', errors) }
  }

  const agreementId = raw.agreementId as string
  const contentHash = raw.contentHash as string
  const analysisVersion = raw.analysisVersion as string

  const resultValidation = validateAnalysisResult(raw.result, { agreementId, contentHash, analysisVersion })
  if (!resultValidation.ok) return resultValidation

  return {
    ok: true,
    value: {
      agreementId,
      contentHash,
      analysisVersion,
      title: raw.title as string,
      sourceUrl: raw.sourceUrl as string | undefined,
      structuredResult: resultValidation.value,
    },
  }
}
