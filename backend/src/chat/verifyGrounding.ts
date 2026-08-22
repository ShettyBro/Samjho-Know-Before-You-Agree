export function isGrounded(sourceText: string, agreementText: string): boolean {
  const trimmed = sourceText.trim()
  if (trimmed.length === 0) return false
  return agreementText.includes(trimmed)
}
