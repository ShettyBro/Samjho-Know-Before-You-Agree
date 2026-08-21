export type FragmentPolicy = 'ignore' | 'include'

export function canonicalizeUrl(rawUrl: string, fragmentPolicy: FragmentPolicy = 'ignore'): string | undefined {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    return undefined
  }

  const protocol = url.protocol.toLowerCase()
  const hostname = url.hostname.toLowerCase()
  const isDefaultPort =
    (protocol === 'https:' && (url.port === '' || url.port === '443')) ||
    (protocol === 'http:' && (url.port === '' || url.port === '80'))
  const port = isDefaultPort ? '' : url.port
  const path = url.pathname.replace(/\/+$/, '') || '/'
  const query = url.search
  const fragment = fragmentPolicy === 'include' ? url.hash : ''

  return `${protocol}//${hostname}${port ? `:${port}` : ''}${path}${query}${fragment}`
}

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export async function computeAgreementId(canonicalSource: string): Promise<string> {
  const hex = await sha256Hex(canonicalSource.normalize('NFC'))
  return `agr:${hex.slice(0, 32)}`
}

export function buildSamePageSourceDescriptor(params: {
  pageOrigin: string
  pageUrl: string
  containerDescriptor: string
  headingPath: string[]
  title: string
}): string {
  let path = '/'
  try {
    path = new URL(params.pageUrl).pathname
  } catch {
    path = '/'
  }
  const normalizedTitle = params.title.trim().toLowerCase()
  return `samePage|${params.pageOrigin}${path}|${params.headingPath.join('>')}|${params.containerDescriptor}|${normalizedTitle}`
}
