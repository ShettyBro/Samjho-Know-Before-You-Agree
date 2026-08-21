import { isSamjhoOwned } from '../../shared/dom'

const EXCLUDED_TAGS = new Set(['SCRIPT', 'STYLE', 'NAV', 'HEADER', 'FOOTER', 'ASIDE', 'NOSCRIPT', 'IFRAME'])
const EXCLUDED_CLASS_HINTS = ['advert', 'sponsor', 'promo', 'recommend', 'breadcrumb', 'pagination']
const BLOCK_TAGS = new Set(['P', 'LI', 'TR', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DIV', 'SECTION', 'ARTICLE'])
export const MAX_EXTRACTED_LENGTH = 20000

function isExcluded(element: Element): boolean {
  if (EXCLUDED_TAGS.has(element.tagName)) return true
  if (isSamjhoOwned(element)) return true
  if (element.getAttribute('aria-hidden') === 'true') return true
  const style = window.getComputedStyle(element)
  if (style.display === 'none' || style.visibility === 'hidden') return true
  const classAndId = `${typeof element.className === 'string' ? element.className : ''} ${element.id}`.toLowerCase()
  return EXCLUDED_CLASS_HINTS.some((hint) => classAndId.includes(hint))
}

export function extractText(root: Element): { text: string; truncated: boolean } {
  const parts: string[] = []
  let truncated = false
  let length = 0

  function walk(node: Node): void {
    if (truncated) return
    if (node.nodeType === Node.TEXT_NODE) {
      const value = node.textContent ?? ''
      if (value.trim().length > 0) {
        parts.push(value)
        length += value.length
        if (length > MAX_EXTRACTED_LENGTH) truncated = true
      }
      return
    }
    if (!(node instanceof Element) || isExcluded(node)) return
    for (const child of Array.from(node.childNodes)) {
      walk(child)
      if (truncated) return
    }
    if (BLOCK_TAGS.has(node.tagName)) parts.push('\n')
  }

  walk(root)
  const original = parts.join('').replace(/\n{3,}/g, '\n\n').trim()
  return { text: original.slice(0, MAX_EXTRACTED_LENGTH), truncated: truncated || original.length > MAX_EXTRACTED_LENGTH }
}

export function normalizeText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
