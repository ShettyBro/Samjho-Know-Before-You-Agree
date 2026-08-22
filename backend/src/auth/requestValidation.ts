import { ApiError } from '../analysis/errors.js'
import { isRecord } from '../analysis/textGuard.js'
import type { ValidationResult } from '../analysis/validationResult.js'
import { isValidEmail, normalizeEmail } from './emailValidation.js'
import { validatePassword } from './passwordPolicy.js'

export type RegisterRequest = { email: string; password: string }
export type LoginRequest = { email: string; password: string }

export function validateRegisterRequest(raw: unknown): ValidationResult<RegisterRequest> {
  if (!isRecord(raw)) {
    return { ok: false, error: new ApiError('VALIDATION_ERROR', 400, 'Request body must be a JSON object') }
  }
  if (typeof raw.email !== 'string') {
    return { ok: false, error: new ApiError('VALIDATION_ERROR', 400, 'A valid email address is required.') }
  }
  const normalizedEmail = normalizeEmail(raw.email)
  if (!isValidEmail(normalizedEmail)) {
    return { ok: false, error: new ApiError('VALIDATION_ERROR', 400, 'A valid email address is required.') }
  }
  const passwordCheck = validatePassword(raw.password)
  if (!passwordCheck.ok) {
    return { ok: false, error: new ApiError('VALIDATION_ERROR', 400, passwordCheck.message) }
  }
  return { ok: true, value: { email: normalizedEmail, password: raw.password as string } }
}

export function validateLoginRequest(raw: unknown): ValidationResult<LoginRequest> {
  if (!isRecord(raw)) {
    return { ok: false, error: new ApiError('VALIDATION_ERROR', 400, 'Request body must be a JSON object') }
  }
  if (typeof raw.email !== 'string') {
    return { ok: false, error: new ApiError('INVALID_CREDENTIALS', 401, 'Email or password is incorrect.') }
  }
  const normalizedEmail = normalizeEmail(raw.email)
  if (!isValidEmail(normalizedEmail)) {
    return { ok: false, error: new ApiError('INVALID_CREDENTIALS', 401, 'Email or password is incorrect.') }
  }
  if (typeof raw.password !== 'string' || raw.password.length === 0) {
    return { ok: false, error: new ApiError('INVALID_CREDENTIALS', 401, 'Email or password is incorrect.') }
  }
  return { ok: true, value: { email: normalizedEmail, password: raw.password } }
}
