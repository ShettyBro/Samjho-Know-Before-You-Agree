const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_EMAIL_LENGTH = 254

export function isValidEmail(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= MAX_EMAIL_LENGTH && EMAIL_PATTERN.test(value)
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}
