import { isSamjhoOwned } from '../../shared/dom'
import type { TermCategory } from '../../shared/discoveryTypes'
import type { LiveCandidate } from '../discovery/types'

const LEGAL_CATEGORIES = new Set<TermCategory>(['terms', 'privacy', 'payment', 'subscription', 'consent'])
const MAX_PROXIMITY_DEPTH = 6
const ACTION_ELEMENT_SELECTOR = 'button, input[type="submit"], input[type="button"], [role="button"]'
const UNRENDERED_PENALTY = 1000

export type ConsentContext = {
  actionCandidateId: string
  actionElement: Element
  agreementCandidateIds: string[]
  bestDepth: number
}

export function isLegalCandidate(candidate: LiveCandidate): boolean {
  return candidate.matchedSignals.some((signal) => LEGAL_CATEGORIES.has(signal.category))
}

export function hasAgreementActionSignal(candidate: LiveCandidate): boolean {
  return candidate.matchedSignals.some((signal) => signal.category === 'agreementAction')
}

type ElementLike = { parentElement?: ElementLike | null; tagName?: string; textContent?: string | null }

function ancestorChain(element: ElementLike, maxDepth: number): ElementLike[] {
  const chain: ElementLike[] = []
  let current: ElementLike | null = element
  for (let depth = 0; depth <= maxDepth && current; depth += 1) {
    chain.push(current)
    current = current.parentElement ?? null
  }
  return chain
}

export function proximityDepth(a: ElementLike, b: ElementLike, maxDepth: number = MAX_PROXIMITY_DEPTH): number | undefined {
  if (a === b) return 0
  const chainA = ancestorChain(a, maxDepth)
  const chainB = ancestorChain(b, maxDepth)
  for (let i = 0; i < chainA.length; i += 1) {
    const j = chainB.indexOf(chainA[i])
    if (j !== -1) return i + j
  }
  return undefined
}

function actionElementKey(element: ElementLike): string {
  const tag = (element.tagName ?? 'element').toLowerCase()
  const text = (element.textContent ?? '').trim().toLowerCase().slice(0, 60)
  return `action:${tag}:${text}`
}

function unrenderedPenalty(element: ElementLike): number {
  const getRect = (element as { getBoundingClientRect?: () => { width: number; height: number } }).getBoundingClientRect
  if (typeof getRect !== 'function') return 0
  const rect = getRect.call(element)
  return rect.width > 0 || rect.height > 0 ? 0 : UNRENDERED_PENALTY
}

export function scanActionElements(root: ParentNode = document): Element[] {
  return Array.from(root.querySelectorAll(ACTION_ELEMENT_SELECTOR)).filter(
    (element) => !isSamjhoOwned(element) && element.isConnected,
  )
}

export function findConsentContexts(
  live: LiveCandidate[],
  actionElements: ElementLike[],
  maxDepth: number = MAX_PROXIMITY_DEPTH,
): ConsentContext[] {
  const legalCandidates = live.filter(isLegalCandidate)
  const liveByElement = new Map(live.map((candidate) => [candidate.element as unknown as ElementLike, candidate]))

  const contexts: ConsentContext[] = []

  for (const element of actionElements) {
    const existingCandidate = liveByElement.get(element)
    const ownSignalEligible = existingCandidate ? hasAgreementActionSignal(existingCandidate) : false

    const nearbyLegal = legalCandidates
      .map((legal) => ({ legal, depth: proximityDepth(element, legal.element as unknown as ElementLike, maxDepth) }))
      .filter((entry): entry is { legal: LiveCandidate; depth: number } => entry.depth !== undefined)
      .sort((a, b) => a.depth - b.depth)

    if (!ownSignalEligible && nearbyLegal.length === 0) continue

    contexts.push({
      actionCandidateId: existingCandidate?.candidateId ?? actionElementKey(element),
      actionElement: element as unknown as Element,
      agreementCandidateIds: nearbyLegal.map((entry) => entry.legal.candidateId),
      bestDepth: (ownSignalEligible ? 0 : nearbyLegal[0].depth) + unrenderedPenalty(element),
    })
  }

  return contexts
}

export function pickBestConsentContext(contexts: ConsentContext[]): ConsentContext | undefined {
  if (contexts.length === 0) return undefined
  return contexts.reduce((best, context) => {
    if (context.bestDepth !== best.bestDepth) return context.bestDepth < best.bestDepth ? context : best
    return context.agreementCandidateIds.length > best.agreementCandidateIds.length ? context : best
  })
}
