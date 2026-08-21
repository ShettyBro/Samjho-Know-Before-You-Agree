export type ResolvedLink = {
  originalHref: string
  resolvedUrl?: string
  isSameOrigin: boolean
  isPdf: boolean
  opensNewTab: boolean
  rejected: boolean
  rejectionReason?: string
}

const DANGEROUS_SCHEMES = ['javascript:', 'data:', 'vbscript:']

export function resolveHref(href: string, baseUrl: string, target?: string | null): ResolvedLink {
  const trimmed = href.trim().toLowerCase()
  if (DANGEROUS_SCHEMES.some((scheme) => trimmed.startsWith(scheme))) {
    return {
      originalHref: href,
      isSameOrigin: false,
      isPdf: false,
      opensNewTab: false,
      rejected: true,
      rejectionReason: 'unsafe URL scheme',
    }
  }

  let resolved: URL
  try {
    resolved = new URL(href, baseUrl)
  } catch {
    return {
      originalHref: href,
      isSameOrigin: false,
      isPdf: false,
      opensNewTab: false,
      rejected: true,
      rejectionReason: 'malformed URL',
    }
  }

  if (resolved.protocol !== 'http:' && resolved.protocol !== 'https:') {
    return {
      originalHref: href,
      isSameOrigin: false,
      isPdf: false,
      opensNewTab: false,
      rejected: true,
      rejectionReason: 'unsupported URL scheme',
    }
  }

  let baseOrigin: string
  try {
    baseOrigin = new URL(baseUrl).origin
  } catch {
    baseOrigin = ''
  }

  return {
    originalHref: href,
    resolvedUrl: resolved.href,
    isSameOrigin: resolved.origin === baseOrigin,
    isPdf: resolved.pathname.toLowerCase().endsWith('.pdf'),
    opensNewTab: target === '_blank',
    rejected: false,
  }
}

export function resolveAnchor(anchor: HTMLAnchorElement, baseUrl: string): ResolvedLink {
  return resolveHref(anchor.getAttribute('href') ?? '', baseUrl, anchor.getAttribute('target'))
}
