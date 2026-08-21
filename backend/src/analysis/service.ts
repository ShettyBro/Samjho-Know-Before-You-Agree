import { ApiError } from './errors.js'
import type { AgreementAnalysisProvider } from './provider.js'
import { validateAnalysisRequest } from './requestValidation.js'
import { validateAnalysisResult } from './responseValidation.js'
import type { AnalysisResult } from './types.js'
import type { ValidationResult } from './validationResult.js'

export async function analyzeAgreement(
  rawRequest: unknown,
  provider: AgreementAnalysisProvider,
): Promise<ValidationResult<AnalysisResult>> {
  const requestValidation = validateAnalysisRequest(rawRequest)
  if (!requestValidation.ok) return requestValidation

  let rawResult: unknown
  try {
    rawResult = await provider.analyze(requestValidation.value)
  } catch {
    return {
      ok: false,
      error: new ApiError('PROVIDER_ERROR', 502, 'The analysis provider failed to produce a result'),
    }
  }

  return validateAnalysisResult(rawResult, {
    agreementId: requestValidation.value.agreementId,
    contentHash: requestValidation.value.contentHash,
    analysisVersion: requestValidation.value.analysisVersion,
  })
}
