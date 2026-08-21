const HTML_LIKE_PATTERN = /<\/?[a-zA-Z][^>]*>/

export function containsHtmlLikeMarkup(text: string): boolean {
  return HTML_LIKE_PATTERN.test(text)
}

export function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
