import { extractText, normalizeText } from './textExtractor'

const RENDER_TIMEOUT_MS = 2500
const STABLE_CHECK_INTERVAL_MS = 250
const REQUIRED_STABLE_CHECKS = 2

export type RenderedDocument = { text: string; normalizedText: string; title: string }

function readIframeDocument(iframe: HTMLIFrameElement): Document | undefined {
  try {
    return iframe.contentDocument ?? undefined
  } catch {
    return undefined
  }
}

function hasNavigatedAwayFromTarget(iframe: HTMLIFrameElement, targetUrl: string): boolean {
  try {
    const currentHref = iframe.contentWindow?.location.href
    if (!currentHref) return false
    const current = new URL(currentHref)
    const target = new URL(targetUrl)
    return current.origin !== target.origin || current.pathname !== target.pathname
  } catch {
    return true
  }
}

function extractFromDocument(doc: Document, iframeWindow: Window): RenderedDocument | undefined {
  if (!doc.body) return undefined
  const container = doc.querySelector('main, article, [role="main"]') ?? doc.body
  const { text } = extractText(container, iframeWindow)
  if (text.length === 0) return undefined
  return { text, normalizedText: normalizeText(text), title: doc.title }
}

export function renderSameOriginUrl(url: string): Promise<RenderedDocument | undefined> {
  return new Promise((resolve) => {
    const iframe = document.createElement('iframe')
    iframe.setAttribute('data-samjho-owned', 'true')
    iframe.setAttribute('aria-hidden', 'true')
    iframe.style.position = 'fixed'
    iframe.style.top = '0'
    iframe.style.left = '0'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = '0'
    iframe.style.opacity = '0'
    iframe.style.pointerEvents = 'none'

    let settled = false
    let lastLength = -1
    let stableCount = 0
    let pollTimer: ReturnType<typeof setInterval> | undefined
    let timeoutTimer: ReturnType<typeof setTimeout> | undefined

    function cleanup(): void {
      if (pollTimer) clearInterval(pollTimer)
      if (timeoutTimer) clearTimeout(timeoutTimer)
      iframe.remove()
    }

    function finish(result: RenderedDocument | undefined): void {
      if (settled) return
      settled = true
      cleanup()
      resolve(result)
    }

    function poll(): void {
      if (hasNavigatedAwayFromTarget(iframe, url)) {
        finish(undefined)
        return
      }

      const doc = readIframeDocument(iframe)
      const iframeWindow = iframe.contentWindow
      if (!doc || !doc.body || !iframeWindow) return

      const length = doc.body.innerText?.length ?? 0
      stableCount = length > 0 && length === lastLength ? stableCount + 1 : 0
      lastLength = length

      if (stableCount >= REQUIRED_STABLE_CHECKS) {
        finish(extractFromDocument(doc, iframeWindow))
      }
    }

    iframe.addEventListener('load', () => {
      if (hasNavigatedAwayFromTarget(iframe, url)) {
        finish(undefined)
        return
      }
      pollTimer = setInterval(poll, STABLE_CHECK_INTERVAL_MS)
    })
    iframe.addEventListener('error', () => finish(undefined))

    timeoutTimer = setTimeout(() => {
      const doc = readIframeDocument(iframe)
      const iframeWindow = iframe.contentWindow
      finish(doc && iframeWindow ? extractFromDocument(doc, iframeWindow) : undefined)
    }, RENDER_TIMEOUT_MS)

    iframe.src = url
    document.body.appendChild(iframe)
  })
}
