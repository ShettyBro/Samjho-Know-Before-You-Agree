import React from 'react'
import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { renderToStaticMarkup } from 'react-dom/server'
import type { AnalysisResultPayload } from '../../shared/analysisResultTypes'
import type { PanelState } from '../state/types'
import { AttentionItemsList } from './AttentionItemsList'
import { DerivedSections } from './DerivedSections'
import { LanguageTabs } from './LanguageTabs'
import { ReadyView } from './ReadyView'
import { StatusView } from './StatusView'

function section(overrides: Partial<AnalysisResultPayload['charges']> = {}) {
  return { available: false, summary: [], relatedAttentionItemIds: [], ...overrides }
}

function baseResult(overrides: Partial<AnalysisResultPayload> = {}): AnalysisResultPayload {
  return {
    agreementId: 'agr:a',
    contentHash: 'sha256:a',
    analysisVersion: 'v1',
    summary: ['This agreement renews automatically each month.'],
    attentionItems: [
      {
        id: 'item-1',
        category: 'autoRenewal',
        importance: 'high',
        confidence: 'high',
        title: 'Automatic renewal',
        explanation: 'Your subscription renews automatically.',
        sourceText: 'Your subscription renews automatically each month.',
        sourceReference: { headingPath: [], containerDescriptor: 'samePage', sourceIndex: 0, sourceType: 'samePage' },
      },
    ],
    obligations: section(),
    charges: section(),
    renewals: section({ available: true, summary: ['Renews monthly.'], relatedAttentionItemIds: ['item-1'] }),
    cancellation: section(),
    dataSharing: section(),
    disputeResolution: section(),
    limitations: [],
    disclaimer: 'Samjho is not legal advice.',
    generatedAt: '2024-01-01T00:00:00.000Z',
    providerMetadata: { provider: 'mock', model: 'mock-v1', generatedAt: '2024-01-01T00:00:00.000Z', inputHash: 'sha256:a', schemaVersion: 'v1' },
    ...overrides,
  }
}

const agreement = {
  agreementId: 'agr:a',
  contentHash: 'sha256:a',
  analysisVersion: 'v1',
  title: 'Terms of Service',
  sourceType: 'samePage' as const,
  sourceUrl: 'https://example.com/terms',
}

test('the idle/detecting status view renders without exposing internal terminology', () => {
  const markup = renderToStaticMarkup(<StatusView state={{ kind: 'DETECTING' }} onRetry={() => undefined} />)
  assert.ok(markup.includes('Looking at this page'))
  assert.ok(!markup.toLowerCase().includes('gemini'))
  assert.ok(!markup.toLowerCase().includes('cache'))
  assert.ok(!markup.toLowerCase().includes('rpc'))
})

test('the prefetching status view uses plain language for the loading experience', () => {
  const state: PanelState = { kind: 'PREFETCHING', agreement, attempt: 0 }
  const markup = renderToStaticMarkup(<StatusView state={state} onRetry={() => undefined} />)
  assert.ok(markup.includes('Understanding the agreement'))
  assert.ok(!markup.includes('%'))
})

test('the ready view renders the summary and attention items', () => {
  const markup = renderToStaticMarkup(<ReadyView agreement={agreement} result={baseResult()} />)
  assert.ok(markup.includes('This agreement renews automatically each month.'))
  assert.ok(markup.includes('Automatic renewal'))
  assert.ok(markup.includes('Analysis ready.'))
})

test('high, medium, and low attention items render distinct, accessible importance labels', () => {
  const items = baseResult({
    attentionItems: [
      { ...baseResult().attentionItems[0], id: 'a', importance: 'high' },
      { ...baseResult().attentionItems[0], id: 'b', importance: 'medium' },
      { ...baseResult().attentionItems[0], id: 'c', importance: 'low' },
    ],
  }).attentionItems
  const markup = renderToStaticMarkup(<AttentionItemsList items={items} />)
  assert.ok(markup.includes('High importance'))
  assert.ok(markup.includes('Medium importance'))
  assert.ok(markup.includes('Low importance'))
})

test('a long source clause renders as an expandable, collapsed-by-default section', () => {
  const longText = 'This clause describes a lengthy obligation. '.repeat(20)
  const items = [{ ...baseResult().attentionItems[0], sourceText: longText }]
  const markup = renderToStaticMarkup(<AttentionItemsList items={items} />)
  assert.ok(markup.includes('<details'))
  assert.ok(!markup.includes('open=""'))
})

test('a short source clause is shown directly without a collapsible control', () => {
  const markup = renderToStaticMarkup(<AttentionItemsList items={baseResult().attentionItems} />)
  assert.ok(!markup.includes('<details'))
})

test('derived sections with no available content are hidden entirely', () => {
  const markup = renderToStaticMarkup(<DerivedSections result={baseResult()} />)
  assert.ok(markup.includes('Automatic renewal'))
  assert.ok(!markup.includes('Data sharing'))
  assert.ok(!markup.includes('Dispute resolution'))
})

test('when no sections are available, nothing is rendered', () => {
  const markup = renderToStaticMarkup(
    <DerivedSections result={baseResult({ renewals: section() })} />,
  )
  assert.equal(markup, '')
})

test('the language tabs mark exactly one tab as selected', () => {
  const markup = renderToStaticMarkup(<LanguageTabs selected="kn" onSelect={() => undefined} />)
  const selectedMatches = markup.match(/aria-selected="true"/g) ?? []
  assert.equal(selectedMatches.length, 1)
  assert.ok(markup.includes('ಕನ್ನಡ'))
})

test('the error status view shows a safe message and a retry action, never raw provider detail', () => {
  const state: PanelState = { kind: 'ERROR', agreement, message: "We couldn't analyze this agreement right now.", attempt: 0 }
  const markup = renderToStaticMarkup(<StatusView state={state} onRetry={() => undefined} />)
  assert.ok(markup.includes('analyze this agreement right now.'))
  assert.ok(markup.includes('Try again'))
  assert.ok(!markup.toLowerCase().includes('502'))
  assert.ok(!markup.toLowerCase().includes('provider_error'))
})

test('the no-agreement status view does not claim a definitive absence of any agreement', () => {
  const markup = renderToStaticMarkup(<StatusView state={{ kind: 'NO_AGREEMENT' }} onRetry={() => undefined} />)
  assert.ok(markup.includes('No agreement detected yet'))
})

test('the unsupported status view explains gracefully without technical jargon', () => {
  const markup = renderToStaticMarkup(<StatusView state={{ kind: 'UNSUPPORTED' }} onRetry={() => undefined} />)
  assert.ok(markup.includes("isn’t supported"))
})
