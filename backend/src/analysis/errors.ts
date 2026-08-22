export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNSUPPORTED_LANGUAGE'
  | 'INVALID_SOURCE'
  | 'PAYLOAD_TOO_LARGE'
  | 'ANALYSIS_SCHEMA_ERROR'
  | 'PROVIDER_ERROR'
  | 'RATE_LIMITED'
  | 'QUOTA_EXHAUSTED'
  | 'INTERNAL_ERROR'
  | 'EMAIL_ALREADY_REGISTERED'
  | 'INVALID_CREDENTIALS'
  | 'UNAUTHENTICATED'
  | 'EXTRACTION_FAILED'

export class ApiError extends Error {
  readonly code: ApiErrorCode
  readonly status: number
  readonly details: string[]

  constructor(code: ApiErrorCode, status: number, message: string, details: string[] = []) {
    super(message)
    this.code = code
    this.status = status
    this.details = details
  }
}
