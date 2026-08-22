import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { panelReducer } from './reducer'
import type { AgreementContext, PanelState } from './types'

function agreement(overrides: Partial<AgreementContext> = {}): AgreementContext {
  return {
    agreementId: 'agr:a',
    contentHash: 'sha256:a',
    analysisVersion: 'v1',
    title: 'Terms of Service',
    sourceType: 'samePage',
    ...overrides,
  }
}

const IDLE: PanelState = { kind: 'IDLE' }

test('the panel starts detecting once a tab becomes active', () => {
  const next = panelReducer(IDLE, { type: 'TAB_CHANGED' })
  assert.deepEqual(next, { kind: 'DETECTING' })
})

test('detection that times out with a content script present becomes NO_AGREEMENT', () => {
  const detecting: PanelState = { kind: 'DETECTING' }
  const next = panelReducer(detecting, { type: 'DETECTION_TIMED_OUT', hasContentScript: true })
  assert.deepEqual(next, { kind: 'NO_AGREEMENT' })
})

test('detection that times out with no content script present becomes UNSUPPORTED', () => {
  const detecting: PanelState = { kind: 'DETECTING' }
  const next = panelReducer(detecting, { type: 'DETECTION_TIMED_OUT', hasContentScript: false })
  assert.deepEqual(next, { kind: 'UNSUPPORTED' })
})

test('finding an agreement while detecting moves to preparing', () => {
  const detecting: PanelState = { kind: 'DETECTING' }
  const next = panelReducer(detecting, { type: 'AGREEMENT_FOUND', agreement: agreement() })
  assert.deepEqual(next, { kind: 'PREPARING', agreement: agreement(), attempt: 0 })
})

test('starting analysis for the matching prepared agreement moves to prefetching', () => {
  const preparing: PanelState = { kind: 'PREPARING', agreement: agreement(), attempt: 0 }
  const next = panelReducer(preparing, { type: 'ANALYSIS_STARTED', agreement: agreement(), attempt: 0 })
  assert.deepEqual(next, { kind: 'PREFETCHING', agreement: agreement(), attempt: 0 })
})

test('a successful analysis for the current agreement becomes ready', () => {
  const prefetching: PanelState = { kind: 'PREFETCHING', agreement: agreement(), attempt: 0 }
  const result = { agreementId: 'agr:a' } as never
  const next = panelReducer(prefetching, { type: 'ANALYSIS_SUCCEEDED', agreement: agreement(), attempt: 0, result })
  assert.equal(next.kind, 'READY')
})

test('a failed analysis for the current agreement becomes an error with a safe message', () => {
  const prefetching: PanelState = { kind: 'PREFETCHING', agreement: agreement(), attempt: 0 }
  const next = panelReducer(prefetching, {
    type: 'ANALYSIS_FAILED',
    agreement: agreement(),
    attempt: 0,
    message: "We couldn't analyze this agreement right now.",
  })
  assert.deepEqual(next, {
    kind: 'ERROR',
    agreement: agreement(),
    message: "We couldn't analyze this agreement right now.",
    attempt: 0,
  })
})

test('switching to a new agreement while one is in progress discards the old one immediately', () => {
  const prefetchingA: PanelState = { kind: 'PREFETCHING', agreement: agreement({ agreementId: 'agr:a' }), attempt: 0 }
  const next = panelReducer(prefetchingA, { type: 'AGREEMENT_FOUND', agreement: agreement({ agreementId: 'agr:b' }) })
  assert.deepEqual(next, { kind: 'PREPARING', agreement: agreement({ agreementId: 'agr:b' }), attempt: 0 })
})

test('a late result for an agreement that is no longer current never becomes visible', () => {
  const prefetchingA: PanelState = { kind: 'PREFETCHING', agreement: agreement({ agreementId: 'agr:a' }), attempt: 0 }
  const switchedToB = panelReducer(prefetchingA, { type: 'AGREEMENT_FOUND', agreement: agreement({ agreementId: 'agr:b' }) })

  const lateResult = panelReducer(switchedToB, {
    type: 'ANALYSIS_SUCCEEDED',
    agreement: agreement({ agreementId: 'agr:a' }),
    attempt: 0,
    result: { agreementId: 'agr:a' } as never,
  })

  assert.deepEqual(lateResult, switchedToB)
  assert.equal(lateResult.kind, 'PREPARING')
})

test('a stale in-flight attempt cannot override a retry that superseded it', () => {
  const errorState: PanelState = { kind: 'ERROR', agreement: agreement(), message: 'failed', attempt: 1 }
  const retried = panelReducer(errorState, { type: 'RETRY_REQUESTED' })
  assert.deepEqual(retried, { kind: 'PREPARING', agreement: agreement(), attempt: 2 })

  const startedRetry = panelReducer(retried, { type: 'ANALYSIS_STARTED', agreement: agreement(), attempt: 2 })
  assert.deepEqual(startedRetry, { kind: 'PREFETCHING', agreement: agreement(), attempt: 2 })

  const staleResult = panelReducer(startedRetry, {
    type: 'ANALYSIS_SUCCEEDED',
    agreement: agreement(),
    attempt: 1,
    result: { agreementId: 'agr:a' } as never,
  })

  assert.deepEqual(staleResult, startedRetry)
})

test('a late agreement found after settling into NO_AGREEMENT still recovers into preparing', () => {
  const detecting: PanelState = { kind: 'DETECTING' }
  const noAgreement = panelReducer(detecting, { type: 'DETECTION_TIMED_OUT', hasContentScript: true })
  assert.deepEqual(noAgreement, { kind: 'NO_AGREEMENT' })

  const recovered = panelReducer(noAgreement, { type: 'AGREEMENT_FOUND', agreement: agreement() })
  assert.deepEqual(recovered, { kind: 'PREPARING', agreement: agreement(), attempt: 0 })
})

test('a late agreement found after settling into UNSUPPORTED still recovers into preparing', () => {
  const detecting: PanelState = { kind: 'DETECTING' }
  const unsupported = panelReducer(detecting, { type: 'DETECTION_TIMED_OUT', hasContentScript: false })
  assert.deepEqual(unsupported, { kind: 'UNSUPPORTED' })

  const recovered = panelReducer(unsupported, { type: 'AGREEMENT_FOUND', agreement: agreement() })
  assert.deepEqual(recovered, { kind: 'PREPARING', agreement: agreement(), attempt: 0 })
})

test('retry only applies from an error state', () => {
  const ready: PanelState = { kind: 'READY', agreement: agreement(), result: {} as never }
  const next = panelReducer(ready, { type: 'RETRY_REQUESTED' })
  assert.deepEqual(next, ready)
})

test('a duplicate agreement-found for the already-active agreement does not restart analysis', () => {
  const prefetching: PanelState = { kind: 'PREFETCHING', agreement: agreement(), attempt: 0 }
  const next = panelReducer(prefetching, { type: 'AGREEMENT_FOUND', agreement: agreement() })
  assert.deepEqual(next, prefetching)
})

test('a cached result for the current agreement goes straight to ready, from any prior state', () => {
  const detecting: PanelState = { kind: 'DETECTING' }
  const result = { agreementId: 'agr:a' } as never
  const next = panelReducer(detecting, { type: 'CACHED_RESULT_FOUND', agreement: agreement(), result })
  assert.deepEqual(next, { kind: 'READY', agreement: agreement(), result })
})

test('a cached result recovers the panel even after it settled into UNSUPPORTED', () => {
  const unsupported: PanelState = { kind: 'UNSUPPORTED' }
  const result = { agreementId: 'agr:a' } as never
  const next = panelReducer(unsupported, { type: 'CACHED_RESULT_FOUND', agreement: agreement(), result })
  assert.deepEqual(next, { kind: 'READY', agreement: agreement(), result })
})

test('a cached result for the agreement already shown as ready is a no-op', () => {
  const result = { agreementId: 'agr:a' } as never
  const ready: PanelState = { kind: 'READY', agreement: agreement(), result }
  const next = panelReducer(ready, { type: 'CACHED_RESULT_FOUND', agreement: agreement(), result })
  assert.deepEqual(next, ready)
})

test('a language change while ready restarts analysis for the same agreement', () => {
  const result = { agreementId: 'agr:a' } as never
  const ready: PanelState = { kind: 'READY', agreement: agreement(), result }
  const next = panelReducer(ready, { type: 'LANGUAGE_CHANGED' })
  assert.deepEqual(next, { kind: 'PREPARING', agreement: agreement(), attempt: 0 })
})

test('a language change while already preparing bumps the attempt so the earlier one is discarded', () => {
  const preparing: PanelState = { kind: 'PREPARING', agreement: agreement(), attempt: 0 }
  const next = panelReducer(preparing, { type: 'LANGUAGE_CHANGED' })
  assert.deepEqual(next, { kind: 'PREPARING', agreement: agreement(), attempt: 1 })
})

test('a language change with no agreement in context is a no-op', () => {
  const idle: PanelState = { kind: 'IDLE' }
  const next = panelReducer(idle, { type: 'LANGUAGE_CHANGED' })
  assert.deepEqual(next, idle)
})
