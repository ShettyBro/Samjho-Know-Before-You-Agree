import { ApiError } from '../analysis/errors.js'
import type { ValidationResult } from '../analysis/validationResult.js'
import { hashPassword, verifyPassword } from './passwordHash.js'
import { validateLoginRequest, validateRegisterRequest } from './requestValidation.js'
import { issueSessionToken } from './token.js'
import { toPublicUser, type PublicUser } from './types.js'
import type { UserRepository } from './userRepository.js'

export type AuthOutcome = { user: PublicUser; token: string }

export async function registerUser(rawRequest: unknown, repository: UserRepository): Promise<ValidationResult<AuthOutcome>> {
  const validation = validateRegisterRequest(rawRequest)
  if (!validation.ok) return validation

  const existing = await repository.findByEmail(validation.value.email)
  if (existing) {
    return { ok: false, error: new ApiError('EMAIL_ALREADY_REGISTERED', 409, 'An account with this email already exists.') }
  }

  const passwordHash = await hashPassword(validation.value.password)
  const user = await repository.createUser({ email: validation.value.email, passwordHash })
  const token = issueSessionToken(user.id)
  if (!token) return { ok: false, error: new ApiError('INTERNAL_ERROR', 500, 'Unable to create account.') }

  return { ok: true, value: { user: toPublicUser(user), token } }
}

export async function loginUser(rawRequest: unknown, repository: UserRepository): Promise<ValidationResult<AuthOutcome>> {
  const validation = validateLoginRequest(rawRequest)
  if (!validation.ok) return validation

  const user = await repository.findByEmail(validation.value.email)
  if (!user) {
    return { ok: false, error: new ApiError('INVALID_CREDENTIALS', 401, 'Email or password is incorrect.') }
  }

  const passwordMatches = await verifyPassword(validation.value.password, user.passwordHash)
  if (!passwordMatches) {
    return { ok: false, error: new ApiError('INVALID_CREDENTIALS', 401, 'Email or password is incorrect.') }
  }

  const token = issueSessionToken(user.id)
  if (!token) return { ok: false, error: new ApiError('INTERNAL_ERROR', 500, 'Unable to sign in right now.') }

  return { ok: true, value: { user: toPublicUser(user), token } }
}
