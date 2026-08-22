import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import type { LiveCandidate } from '../discovery/types'
import {
  findConsentContexts,
  hasAgreementActionSignal,
  isLegalCandidate,
  pickBestConsentContext,
  proximityDepth,
} from './consentContext'

function candidate(overrides: Partial<LiveCandidate> = {}): LiveCandidate {
  return {
    candidateId: 'candidate-1',
    elementType: 'link',
    matchedText: 'Conditions of Use',
    matchedSignals: [{ kind: 'linkText', category: 'terms', matchedText: 'Conditions of Use' }],
    associatedLinks: [],
    confidence: 'high',
    confidenceScore: 6,
    source: 'initialScan',
    firstSeenAt: Date.now(),
    lastSeenAt: Date.now(),
    element: {} as Element,
    ...overrides,
  }
}

test('isLegalCandidate is true for terms, privacy, payment, subscription, and consent categories', () => {
  const categories = ['terms', 'privacy', 'payment', 'subscription', 'consent'] as const
  for (const category of categories) {
    assert.equal(
      isLegalCandidate(candidate({ matchedSignals: [{ kind: 'linkText', category, matchedText: 'x' }] })),
      true,
      category,
    )
  }
})

test('isLegalCandidate is false for an agreementAction-only candidate', () => {
  assert.equal(
    isLegalCandidate(candidate({ matchedSignals: [{ kind: 'buttonText', category: 'agreementAction', matchedText: 'I Agree' }] })),
    false,
  )
})

test('hasAgreementActionSignal is true only when an agreementAction signal is present', () => {
  assert.equal(
    hasAgreementActionSignal(candidate({ matchedSignals: [{ kind: 'buttonText', category: 'agreementAction', matchedText: 'I Agree' }] })),
    true,
  )
  assert.equal(hasAgreementActionSignal(candidate()), false)
})

test('proximityDepth is zero for the same element', () => {
  const element = {}
  assert.equal(proximityDepth(element, element), 0)
})

test('proximityDepth finds a nearby common ancestor across a parent/child chain', () => {
  const container = { parentElement: null }
  const button = { parentElement: container }
  const link = { parentElement: container }
  assert.equal(proximityDepth(button, link), 2)
})

test('proximityDepth returns undefined for elements with no common ancestor within the depth limit', () => {
  const button = { parentElement: null }
  const link = { parentElement: null }
  assert.equal(proximityDepth(button, link, 4), undefined)
})

test('proximityDepth respects a caller-supplied max depth', () => {
  type Chain = { parentElement: Chain | null }
  const commonAncestor: Chain = { parentElement: null }

  function branch(depth: number): Chain {
    let node = commonAncestor
    for (let i = 0; i < depth; i += 1) node = { parentElement: node }
    return node
  }

  const button = { parentElement: branch(5) }
  const link = { parentElement: branch(5) }

  assert.equal(proximityDepth(button, link, 2), undefined)
  assert.equal(proximityDepth(button, link, 12), 12)
})

test('an Amazon-style consent context associates one action with two independent legal candidates, not merged', () => {
  const container = { parentElement: null }
  const continueButton = { parentElement: container }
  const conditionsLink = { parentElement: container }
  const privacyLink = { parentElement: container }

  const live: LiveCandidate[] = [
    candidate({
      candidateId: 'conditions-of-use',
      elementType: 'link',
      matchedText: 'Conditions of Use',
      matchedSignals: [{ kind: 'linkText', category: 'terms', matchedText: 'Conditions of Use' }],
      element: conditionsLink as unknown as Element,
    }),
    candidate({
      candidateId: 'privacy-notice',
      elementType: 'link',
      matchedText: 'Privacy Notice',
      matchedSignals: [{ kind: 'linkText', category: 'privacy', matchedText: 'Privacy Notice' }],
      element: privacyLink as unknown as Element,
    }),
  ]

  const contexts = findConsentContexts(live, [continueButton])
  assert.equal(contexts.length, 1)
  assert.equal(contexts[0].actionElement, continueButton)
  assert.deepEqual([...contexts[0].agreementCandidateIds].sort(), ['conditions-of-use', 'privacy-notice'])
})

test('a consent context forms without any checkbox present, purely from a button and nearby agreement links', () => {
  const container = { parentElement: null }
  const submitButton = { parentElement: container }
  const termsLink = { parentElement: container }

  const live: LiveCandidate[] = [
    candidate({
      candidateId: 'terms-link',
      matchedSignals: [{ kind: 'linkText', category: 'terms', matchedText: 'Terms' }],
      element: termsLink as unknown as Element,
    }),
  ]

  const contexts = findConsentContexts(live, [submitButton])
  assert.equal(contexts.length, 1)
  assert.deepEqual(contexts[0].agreementCandidateIds, ['terms-link'])
})

test('a checkbox with its own agreementAction signal qualifies even with no nearby legal candidate in range', () => {
  const checkbox = { parentElement: null }
  const distantLegal = { parentElement: { parentElement: { parentElement: { parentElement: { parentElement: { parentElement: { parentElement: null } } } } } } }

  const live: LiveCandidate[] = [
    candidate({
      candidateId: 'agree-checkbox',
      elementType: 'checkbox',
      matchedSignals: [{ kind: 'checkboxLabel', category: 'agreementAction', matchedText: 'I agree to Terms' }],
      element: checkbox as unknown as Element,
    }),
    candidate({
      candidateId: 'far-terms-link',
      matchedSignals: [{ kind: 'linkText', category: 'terms', matchedText: 'Terms' }],
      element: distantLegal as unknown as Element,
    }),
  ]

  const contexts = findConsentContexts(live, [checkbox])
  assert.equal(contexts.length, 1)
  assert.equal(contexts[0].actionCandidateId, 'agree-checkbox')
  assert.deepEqual(contexts[0].agreementCandidateIds, [])
})

test('an unrelated button with no agreementAction signal and no nearby legal candidate is not an eligible consent context', () => {
  const container = { parentElement: null }
  const addToCartButton = { parentElement: container }
  const distantLegal = { parentElement: { parentElement: { parentElement: { parentElement: { parentElement: { parentElement: { parentElement: null } } } } } } }

  const live: LiveCandidate[] = [
    candidate({
      candidateId: 'far-terms-link',
      matchedSignals: [{ kind: 'linkText', category: 'terms', matchedText: 'Terms' }],
      element: distantLegal as unknown as Element,
    }),
  ]

  const contexts = findConsentContexts(live, [addToCartButton])
  assert.equal(contexts.length, 0)
})

test('pickBestConsentContext prefers the closest context over one with more agreement candidates but farther away', () => {
  const contexts = [
    { actionCandidateId: 'far', actionElement: {} as Element, agreementCandidateIds: ['x', 'y'], bestDepth: 4 },
    { actionCandidateId: 'near', actionElement: {} as Element, agreementCandidateIds: ['x'], bestDepth: 2 },
  ]
  const best = pickBestConsentContext(contexts)
  assert.equal(best?.actionCandidateId, 'near')
})

test('pickBestConsentContext prefers the context associated with the most agreement candidates among equally close contexts', () => {
  const contexts = [
    { actionCandidateId: 'a', actionElement: {} as Element, agreementCandidateIds: ['x'], bestDepth: 2 },
    { actionCandidateId: 'b', actionElement: {} as Element, agreementCandidateIds: ['x', 'y'], bestDepth: 2 },
  ]
  const best = pickBestConsentContext(contexts)
  assert.equal(best?.actionCandidateId, 'b')
})

test('pickBestConsentContext returns undefined for an empty list', () => {
  assert.equal(pickBestConsentContext([]), undefined)
})

test('among two candidate actions near the same legal links, the one with the smaller proximity depth is preferred', () => {
  const container = { parentElement: null }
  const nearButton = { parentElement: container }
  const farContainer = { parentElement: { parentElement: { parentElement: container } } }
  const farButton = { parentElement: farContainer }
  const conditionsLink = { parentElement: container }

  const live: LiveCandidate[] = [
    candidate({
      candidateId: 'conditions-of-use',
      matchedSignals: [{ kind: 'linkText', category: 'terms', matchedText: 'Conditions of Use' }],
      element: conditionsLink as unknown as Element,
    }),
  ]

  const contexts = findConsentContexts(live, [farButton, nearButton])
  const best = pickBestConsentContext(contexts)
  assert.equal(best?.actionElement, nearButton)
})

function withRect<T extends object>(element: T, rect: { width: number; height: number }): T & { getBoundingClientRect: () => typeof rect } {
  return Object.assign(element, { getBoundingClientRect: () => rect })
}

test('an unrendered (zero-size) action element is deprioritized in favor of an equally-close rendered one', () => {
  const container = { parentElement: null }
  const hiddenDecoy = withRect({ parentElement: container }, { width: 0, height: 0 })
  const realButton = withRect({ parentElement: container }, { width: 90, height: 32 })
  const conditionsLink = { parentElement: container }

  const live: LiveCandidate[] = [
    candidate({
      candidateId: 'conditions-of-use',
      matchedSignals: [{ kind: 'linkText', category: 'terms', matchedText: 'Conditions of Use' }],
      element: conditionsLink as unknown as Element,
    }),
  ]

  const contexts = findConsentContexts(live, [hiddenDecoy, realButton])
  const best = pickBestConsentContext(contexts)
  assert.equal(best?.actionElement, realButton)
})

test('an unrendered action element is still returned as a valid, eligible context when it is the only candidate available', () => {
  const container = { parentElement: null }
  const onlyCandidate = withRect({ parentElement: container }, { width: 0, height: 0 })
  const conditionsLink = { parentElement: container }

  const live: LiveCandidate[] = [
    candidate({
      candidateId: 'conditions-of-use',
      matchedSignals: [{ kind: 'linkText', category: 'terms', matchedText: 'Conditions of Use' }],
      element: conditionsLink as unknown as Element,
    }),
  ]

  const contexts = findConsentContexts(live, [onlyCandidate])
  assert.equal(contexts.length, 1)
  const best = pickBestConsentContext(contexts)
  assert.equal(best?.actionElement, onlyCandidate)
})
