export function formatSourceLocation(sourceUrl: string | undefined): string | undefined {
  if (!sourceUrl) return undefined
  try {
    const url = new URL(sourceUrl)
    const path = url.pathname === '/' ? '' : url.pathname
    return `${url.hostname}${path}`
  } catch {
    return undefined
  }
}
