import { DEFAULT_LANGUAGE } from '../../shared/analysisRequestTypes'
import type { LiveCandidate } from '../discovery/types'
import { syncAffordance } from './AffordanceManager'
import { findConsentContexts, pickBestConsentContext, scanActionElements } from './consentContext'
import { POPUP_LABELS } from './labels'
import { showPopup } from './PopupHost'

const shownForCandidateId = new Set<string>()
let trackedActionElements = new Map<string, Element>()
let listenerAttached = false

type ElementLike = { parentElement?: ElementLike | null }

export function findTrackedCandidateId(tracked: Map<string, Element>, target: EventTarget | null): string | undefined {
  let current = target as ElementLike | null
  while (current) {
    for (const [candidateId, element] of tracked) {
      if ((element as unknown as ElementLike) === current) return candidateId
    }
    current = current.parentElement ?? null
  }
  return undefined
}

function handleDocumentClick(event: MouseEvent): void {
  const candidateId = findTrackedCandidateId(trackedActionElements, event.target)
  if (!candidateId) return
  if (shownForCandidateId.has(candidateId)) return
  shownForCandidateId.add(candidateId)
  showPopup(DEFAULT_LANGUAGE)
}

export function initPopupFeature(): void {
  if (listenerAttached) return
  listenerAttached = true
  document.addEventListener('click', handleDocumentClick, true)
}

export function updateLiveCandidates(live: LiveCandidate[]): void {
  const actionElements = scanActionElements()
  const contexts = findConsentContexts(live, actionElements)
  trackedActionElements = new Map(contexts.map((context) => [context.actionCandidateId, context.actionElement]))

  const best = pickBestConsentContext(contexts)
  if (!best) {
    syncAffordance(null, '', () => undefined)
    return
  }

  syncAffordance(best.actionElement, POPUP_LABELS[DEFAULT_LANGUAGE].affordance, () => showPopup(DEFAULT_LANGUAGE))
}
