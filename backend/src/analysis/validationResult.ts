import type { ApiError } from './errors.js'

export type ValidationSuccess<T> = { ok: true; value: T }
export type ValidationFailure = { ok: false; error: ApiError }
export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure
