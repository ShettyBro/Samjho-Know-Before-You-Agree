import { createHash } from 'node:crypto'

export const WEB_NORMALIZATION_VERSION = 'v1'
export const WEB_HASH_ALGORITHM = 'SHA-256'

function sha256Hex(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex')
}

export function canonicalizeForHash(normalizedText: string): string {
  return normalizedText
    .normalize('NFC')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .filter((line) => line.length > 0)
    .join('\n')
}

export function normalizeWebText(rawText: string): string {
  return canonicalizeForHash(rawText)
}

export function computeWebContentHash(normalizedText: string): string {
  return `sha256:${sha256Hex(canonicalizeForHash(normalizedText))}`
}

export function computeWebAgreementId(sourceType: 'pastedText' | 'pdf', contentHash: string): string {
  const canonicalSource = `web:${sourceType}:${contentHash}`
  return `agr:${sha256Hex(canonicalSource.normalize('NFC')).slice(0, 32)}`
}
