export const NORMALIZATION_VERSION = 'v1'
export const HASH_ALGORITHM = 'SHA-256'

const digestCache = new Map<string, Promise<string>>()

export function canonicalizeForHash(normalizedText: string): string {
  return normalizedText
    .normalize('NFC')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .filter((line) => line.length > 0)
    .join('\n')
}

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export async function computeContentHash(normalizedText: string): Promise<{ hash: string; canonical: string }> {
  const canonical = canonicalizeForHash(normalizedText)

  let pending = digestCache.get(canonical)
  if (!pending) {
    pending = sha256Hex(canonical)
    digestCache.set(canonical, pending)
  }

  const hex = await pending
  return { hash: `sha256:${hex}`, canonical }
}
