import type { AgreementSourceType } from '../../shared/extractionTypes'

export type ContainerMatch = { element: Element; strategy: string }

const CONTAINER_SELECTORS = [
  'dialog',
  '[role="dialog"]',
  'details',
  '[class*="modal" i]',
  '[class*="accordion" i]',
  'section',
  'article',
]

const MAX_ANCESTOR_DEPTH = 8

export function locateContainer(start: Element): ContainerMatch | undefined {
  let current: Element | null = start
  let depth = 0
  while (current && current.tagName !== 'BODY' && depth < MAX_ANCESTOR_DEPTH) {
    for (const selector of CONTAINER_SELECTORS) {
      if (current.matches(selector)) return { element: current, strategy: selector }
    }
    current = current.parentElement
    depth++
  }
  return undefined
}

export function nearestFallbackContainer(start: Element): Element {
  return start.closest('form, li, div, section') ?? start.parentElement ?? start
}

export function classifyContainerSourceType(match: ContainerMatch): AgreementSourceType {
  if (match.strategy === 'dialog' || match.strategy === '[role="dialog"]' || match.strategy.includes('modal')) {
    return 'modal'
  }
  if (match.strategy === 'details' || match.strategy.includes('accordion')) return 'accordion'
  return 'samePage'
}

export function describeContainer(element: Element): string {
  const idPart = element.id ? `#${element.id}` : ''
  const firstClass = typeof element.className === 'string' ? element.className.trim().split(/\s+/)[0] : ''
  const classPart = firstClass ? `.${firstClass}` : ''
  return `${element.tagName.toLowerCase()}${idPart}${classPart}`
}

export function computeHeadingPath(element: Element): string[] {
  const path: string[] = []
  let current: Element | null = element
  let depth = 0
  while (current && depth < 5) {
    let sibling = current.previousElementSibling
    while (sibling) {
      if (/^H[1-6]$/.test(sibling.tagName)) {
        path.unshift(sibling.textContent?.trim() ?? '')
        break
      }
      sibling = sibling.previousElementSibling
    }
    current = current.parentElement
    depth++
  }
  return path.filter((entry) => entry.length > 0)
}
