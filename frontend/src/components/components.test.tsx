import React from 'react'
import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { renderToStaticMarkup } from 'react-dom/server'
import type { AnalysisResultPayload } from '../api/types.js'
import type { AnalysisState } from '../state/analysisTypes.js'
import { AnalyzeInput } from './AnalyzeInput.js'
import { AuthModal } from './AuthModal.js'
import { AuthPanel } from './AuthPanel.js'
import { Header } from './Header.js'
import { HistoryModal } from './HistoryModal.js'
import { LanguageTabs } from './LanguageTabs.js'
import { Navbar } from './Navbar.js'
import { ResultView } from './ResultView.js'
import { StatusView } from './StatusView.js'

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
        sourceReference: { headingPath: [], containerDescriptor: 'pastedText', sourceIndex: 0, sourceType: 'pastedText' },
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

test('the header tagline switches language', () => {
  const englishMarkup = renderToStaticMarkup(<Header language="en" />)
  const hindiMarkup = renderToStaticMarkup(<Header language="hi" />)
  assert.ok(englishMarkup.includes('Know Before You Agree'))
  assert.ok(!hindiMarkup.includes('Know Before You Agree'))
})

test('exactly one language tab is marked selected', () => {
  const markup = renderToStaticMarkup(<LanguageTabs selected="kn" onSelect={() => undefined} />)
  const selectedMatches = markup.match(/aria-selected="true"/g) ?? []
  assert.equal(selectedMatches.length, 1)
  assert.ok(markup.includes('ಕನ್ನಡ'))
})

test('the auth panel shows login/register tabs when signed out', () => {
  const markup = renderToStaticMarkup(
    <AuthPanel
      language="en"
      user={null}
      pending={false}
      error={null}
      onLogin={async () => true}
      onRegister={async () => true}
      onLogout={async () => undefined}
    />,
  )
  assert.ok(markup.includes('Log in'))
  assert.ok(markup.includes('Create account'))
})

test('the auth panel shows the signed-in email and a logout button when a user is present', () => {
  const markup = renderToStaticMarkup(
    <AuthPanel
      language="en"
      user={{ id: 'usr_1', email: 'user@example.com', createdAt: '2024-01-01T00:00:00.000Z' }}
      pending={false}
      error={null}
      onLogin={async () => true}
      onRegister={async () => true}
      onLogout={async () => undefined}
    />,
  )
  assert.ok(markup.includes('user@example.com'))
  assert.ok(markup.includes('Log out'))
})

test('the auth panel surfaces a safe login error message', () => {
  const markup = renderToStaticMarkup(
    <AuthPanel
      language="en"
      user={null}
      pending={false}
      error="Email or password is incorrect."
      onLogin={async () => false}
      onRegister={async () => true}
      onLogout={async () => undefined}
    />,
  )
  assert.ok(markup.includes('Email or password is incorrect.'))
})

test('the analyze input renders the paste textarea by default', () => {
  const markup = renderToStaticMarkup(<AnalyzeInput language="en" busy={false} onSubmitText={() => undefined} onSubmitPdf={() => undefined} />)
  assert.ok(markup.includes('samjho-paste-textarea'))
  assert.ok(markup.includes('Analyze'))
})

test('the status view renders nothing for the idle state', () => {
  const markup = renderToStaticMarkup(<StatusView state={{ kind: 'IDLE' }} language="en" onRetry={() => undefined} />)
  assert.equal(markup, '')
})

test('the status view shows an input error message', () => {
  const state: AnalysisState = { kind: 'INPUT_ERROR', message: 'Please paste some agreement text first.' }
  const markup = renderToStaticMarkup(<StatusView state={state} language="en" onRetry={() => undefined} />)
  assert.ok(markup.includes('Please paste some agreement text first.'))
})

test('the status view shows a loading indicator while preparing', () => {
  const state: AnalysisState = { kind: 'PREPARING' }
  const markup = renderToStaticMarkup(<StatusView state={state} language="en" onRetry={() => undefined} />)
  assert.ok(markup.includes('Preparing your agreement'))
})

test('the status view shows a safe error message and a retry action, never raw provider detail', () => {
  const state: AnalysisState = { kind: 'ERROR', message: "We couldn't analyze this agreement right now." }
  const markup = renderToStaticMarkup(<StatusView state={state} language="en" onRetry={() => undefined} />)
  assert.ok(markup.includes('analyze this agreement right now.'))
  assert.ok(markup.includes('Try again'))
  assert.ok(!markup.toLowerCase().includes('502'))
})

test('the result view renders the summary and attention items', () => {
  const markup = renderToStaticMarkup(<ResultView result={baseResult()} language="en" />)
  assert.ok(markup.includes('This agreement renews automatically each month.'))
  assert.ok(markup.includes('Automatic renewal'))
  assert.ok(markup.includes('Analysis ready.'))
})

test('the result view switches language for its headings', () => {
  const englishMarkup = renderToStaticMarkup(<ResultView result={baseResult()} language="en" />)
  const kannadaMarkup = renderToStaticMarkup(<ResultView result={baseResult()} language="kn" />)
  assert.ok(englishMarkup.includes('Important things to know'))
  assert.ok(kannadaMarkup.includes('ತಿಳಿದುಕೊಳ್ಳಬೇಕಾದ ಮುಖ್ಯ ಅಂಶಗಳು'))
})

test('derived sections with no available content are hidden entirely', () => {
  const markup = renderToStaticMarkup(<ResultView result={baseResult()} language="en" />)
  assert.ok(markup.includes('Automatic renewal'))
  assert.ok(!markup.includes('Data sharing'))
})

test('the navbar shows the brand name and a log in button when signed out', () => {
  const markup = renderToStaticMarkup(
    <Navbar
      language="en"
      onLanguageChange={() => undefined}
      user={null}
      onLogout={async () => undefined}
      onOpenHistory={() => undefined}
      onOpenAuth={() => undefined}
      onGoHome={() => undefined}
    />,
  )
  assert.ok(markup.includes('Samjho'))
  assert.ok(markup.includes('Log in'))
})

test('the navbar shows the signed-in email and a logout button when a user is present', () => {
  const markup = renderToStaticMarkup(
    <Navbar
      language="en"
      onLanguageChange={() => undefined}
      user={{ id: 'usr_1', email: 'user@example.com', createdAt: '2024-01-01T00:00:00.000Z' }}
      onLogout={async () => undefined}
      onOpenHistory={() => undefined}
      onOpenAuth={() => undefined}
      onGoHome={() => undefined}
    />,
  )
  assert.ok(markup.includes('user@example.com'))
  assert.ok(markup.includes('Log out'))
})

test('the history modal shows history and saved items, marking a version change', () => {
  const markup = renderToStaticMarkup(
    <HistoryModal
      language="en"
      historyItems={[
        {
          agreementId: 'agr:a',
          contentHash: 'sha256:h2',
          analysisVersion: 'v1',
          title: 'Terms of Service',
          analyzedAt: '2024-02-01T00:00:00.000Z',
          changed: true,
          previousContentHash: 'sha256:h1',
          previousAnalyzedAt: '2024-01-01T00:00:00.000Z',
        },
      ]}
      savedItems={[]}
      openResult={null}
      onOpenHistoryItem={() => undefined}
      onOpenSavedItem={() => undefined}
      onUnsave={() => undefined}
      onCloseResult={() => undefined}
      onClose={() => undefined}
    />,
  )
  assert.ok(markup.includes('Terms of Service'))
  assert.ok(markup.includes('Agreement updated'))
})

test('the history modal shows an empty saved message with no saved agreements', () => {
  const markup = renderToStaticMarkup(
    <HistoryModal
      language="en"
      historyItems={[]}
      savedItems={[]}
      openResult={null}
      onOpenHistoryItem={() => undefined}
      onOpenSavedItem={() => undefined}
      onUnsave={() => undefined}
      onCloseResult={() => undefined}
      onClose={() => undefined}
    />,
  )
  assert.ok(markup.includes('No agreements analyzed yet.'))
})

test('the auth modal renders as a labeled dialog with the auth panel inside', () => {
  const markup = renderToStaticMarkup(
    <AuthModal
      language="en"
      user={null}
      pending={false}
      error={null}
      onLogin={async () => true}
      onRegister={async () => true}
      onLogout={async () => undefined}
      onClose={() => undefined}
    />,
  )
  assert.ok(markup.includes('Log in'))
  assert.ok(markup.includes('Create account'))
})
