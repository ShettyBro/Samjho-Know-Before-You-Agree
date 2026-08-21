import { isSamjhoOwned } from '../../shared/dom'
import type { AssociatedLink, CandidateElementType, MatchedSignal } from '../../shared/discoveryTypes'
import { matchBodyText, matchLabelText, matchUrlPath } from './matching'

export type CandidateDraft = {
  element: Element
  elementType: CandidateElementType
  matchedText: string
  matchedSignals: MatchedSignal[]
  associatedLinks: AssociatedLink[]
  targetUrl?: string
}

const BODY_TEXT_SELECTOR = 'p, li, span, div, td, dt, dd'
const MAX_BODY_TEXT_LENGTH = 160
const MAX_NEARBY_TEXT_LENGTH = 200

function queryAll(root: ParentNode, selector: string): Element[] {
  const results: Element[] = []
  if (root instanceof Element && root.matches(selector)) results.push(root)
  results.push(...Array.from(root.querySelectorAll(selector)))
  return results
}

function resolveUrl(href: string): string | undefined {
  try {
    return new URL(href, window.location.href).href
  } catch {
    return undefined
  }
}

function findCheckboxLabel(input: HTMLInputElement): string {
  if (input.id) {
    const byFor = document.querySelector(`label[for="${CSS.escape(input.id)}"]`)
    if (byFor?.textContent) return byFor.textContent
  }
  const wrappingLabel = input.closest('label')
  if (wrappingLabel?.textContent) return wrappingLabel.textContent
  const ariaLabel = input.getAttribute('aria-label')
  if (ariaLabel) return ariaLabel
  return input.parentElement?.textContent ?? ''
}

function nearbyText(element: Element): string {
  const container = element.closest('form, li, label, section') ?? element.parentElement
  return container?.textContent?.slice(0, MAX_NEARBY_TEXT_LENGTH) ?? ''
}

function scanLinks(root: ParentNode): CandidateDraft[] {
  const drafts: CandidateDraft[] = []
  for (const anchor of queryAll(root, 'a[href]')) {
    if (isSamjhoOwned(anchor)) continue
    const text = anchor.textContent ?? ''
    const href = anchor.getAttribute('href') ?? ''
    const signals = [...matchLabelText(text, 'linkText'), ...matchUrlPath(href, window.location.href)]
    const ariaLabel = anchor.getAttribute('aria-label')
    if (ariaLabel) signals.push(...matchLabelText(ariaLabel, 'ariaLabel'))
    const title = anchor.getAttribute('title')
    if (title) signals.push(...matchLabelText(title, 'title'))
    if (signals.length === 0) continue

    const targetUrl = resolveUrl(href)
    drafts.push({
      element: anchor,
      elementType: 'link',
      matchedText: text.trim() || href,
      matchedSignals: signals,
      associatedLinks: targetUrl ? [{ text: text.trim(), url: targetUrl }] : [],
      targetUrl,
    })
  }
  return drafts
}

function scanButtons(root: ParentNode): CandidateDraft[] {
  const drafts: CandidateDraft[] = []
  for (const button of queryAll(root, 'button, input[type="submit"], input[type="button"], [role="button"]')) {
    if (isSamjhoOwned(button)) continue
    const text = button instanceof HTMLInputElement ? button.value : (button.textContent ?? '')
    const signals = matchLabelText(text, 'buttonText')
    const ariaLabel = button.getAttribute('aria-label')
    if (ariaLabel) signals.push(...matchLabelText(ariaLabel, 'ariaLabel'))

    const nearbySignals = matchBodyText(nearbyText(button), 'nearbyText')
    const combined = [...signals, ...nearbySignals]
    if (combined.length === 0) continue

    drafts.push({
      element: button,
      elementType: 'button',
      matchedText: text.trim(),
      matchedSignals: combined,
      associatedLinks: [],
    })
  }
  return drafts
}

function scanCheckboxes(root: ParentNode): CandidateDraft[] {
  const drafts: CandidateDraft[] = []
  for (const checkbox of queryAll(root, 'input[type="checkbox"]')) {
    if (!(checkbox instanceof HTMLInputElement) || isSamjhoOwned(checkbox)) continue
    const labelText = findCheckboxLabel(checkbox)
    const signals = matchLabelText(labelText, 'checkboxLabel')
    if (signals.length === 0) continue

    const label = checkbox.closest('label') ?? checkbox.parentElement
    const linkInLabel = label?.querySelector('a[href]')
    const associatedLinks: AssociatedLink[] = []
    if (linkInLabel instanceof HTMLAnchorElement) {
      const url = resolveUrl(linkInLabel.getAttribute('href') ?? '')
      if (url) associatedLinks.push({ text: linkInLabel.textContent?.trim() ?? '', url })
    }

    drafts.push({
      element: checkbox,
      elementType: 'checkbox',
      matchedText: labelText.trim(),
      matchedSignals: signals,
      associatedLinks,
      targetUrl: associatedLinks[0]?.url,
    })
  }
  return drafts
}

function scanHeadings(root: ParentNode): CandidateDraft[] {
  const drafts: CandidateDraft[] = []
  for (const heading of queryAll(root, 'h1, h2, h3, h4, h5, h6')) {
    if (isSamjhoOwned(heading)) continue
    const text = heading.textContent ?? ''
    const signals = matchLabelText(text, 'heading')
    if (signals.length === 0) continue
    drafts.push({
      element: heading,
      elementType: 'heading',
      matchedText: text.trim(),
      matchedSignals: signals,
      associatedLinks: [],
    })
  }
  return drafts
}

function scanBodyText(root: ParentNode): CandidateDraft[] {
  const drafts: CandidateDraft[] = []
  for (const block of queryAll(root, BODY_TEXT_SELECTOR)) {
    if (isSamjhoOwned(block)) continue
    if (block.childElementCount > 0) continue
    const text = block.textContent?.trim() ?? ''
    if (text.length === 0 || text.length > MAX_BODY_TEXT_LENGTH) continue
    const signals = matchBodyText(text, 'visibleText')
    if (signals.length === 0) continue
    drafts.push({
      element: block,
      elementType: 'text',
      matchedText: text,
      matchedSignals: signals,
      associatedLinks: [],
    })
  }
  return drafts
}

export function scanRoot(root: ParentNode): CandidateDraft[] {
  if (root instanceof Element && isSamjhoOwned(root)) return []
  return [
    ...scanLinks(root),
    ...scanButtons(root),
    ...scanCheckboxes(root),
    ...scanHeadings(root),
    ...scanBodyText(root),
  ]
}
