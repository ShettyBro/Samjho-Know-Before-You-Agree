export const MIN_PASSWORD_LENGTH = 8
export const MAX_PASSWORD_LENGTH = 128

export type PasswordCheck = { ok: true } | { ok: false; message: string }

export function validatePassword(password: unknown): PasswordCheck {
  if (typeof password !== 'string' || password.length === 0) {
    return { ok: false, message: 'Password is required.' }
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` }
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return { ok: false, message: 'Password is too long.' }
  }
  return { ok: true }
}
