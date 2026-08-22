import React from 'react'
import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { renderToStaticMarkup } from 'react-dom/server'
import type { DisplayChatMessage } from '../state/useChat'
import { AskSamjho } from './AskSamjho'
import { AskSamjhoLauncher } from './AskSamjhoLauncher'
import { ChatMessageItem } from './ChatMessageItem'

test('a user message renders its text without a listen control', () => {
  const message: DisplayChatMessage = { id: '1', role: 'user', text: 'Will this renew automatically?' }
  const markup = renderToStaticMarkup(<ChatMessageItem message={message} language="en" />)
  assert.ok(markup.includes('Will this renew automatically?'))
  assert.ok(!markup.includes('Listen'))
})

test('an assistant message with source evidence renders the source clause and a disabled listen placeholder', () => {
  const message: DisplayChatMessage = {
    id: '2',
    role: 'assistant',
    text: 'Yes, it renews automatically each month.',
    sourceText: 'Your subscription renews automatically each month.',
    confidence: 'high',
    notFound: false,
  }
  const markup = renderToStaticMarkup(<ChatMessageItem message={message} language="en" />)
  assert.ok(markup.includes('Your subscription renews automatically each month.'))
  assert.ok(markup.includes('Listen'))
  assert.ok(markup.includes('disabled'))
})

test('an assistant message with no source evidence does not render a source clause', () => {
  const message: DisplayChatMessage = { id: '3', role: 'assistant', text: "The agreement doesn't cover that.", notFound: true }
  const markup = renderToStaticMarkup(<ChatMessageItem message={message} language="en" />)
  assert.ok(!markup.includes('Source clause'))
})

test('Ask Samjho shows suggested questions before any question has been asked', () => {
  const markup = renderToStaticMarkup(
    <AskSamjho agreementId="agr:a" contentHash="sha256:a" analysisVersion="v1" agreementText="Sample agreement text." language="en" />,
  )
  assert.ok(markup.includes('Will this renew automatically?'))
  assert.ok(markup.includes('Can I cancel anytime?'))
})

test('the launcher renders only a floating button when closed, not the chat overlay', () => {
  const markup = renderToStaticMarkup(
    <AskSamjhoLauncher agreementId="agr:a" contentHash="sha256:a" analysisVersion="v1" agreementText="Sample agreement text." language="en" />,
  )
  assert.ok(markup.includes('samjho-chat-launcher'))
  assert.ok(!markup.includes('samjho-chat-overlay'))
  assert.ok(!markup.includes('Will this renew automatically?'))
})

test('the launcher button label switches language along with the rest of the panel', () => {
  const englishMarkup = renderToStaticMarkup(
    <AskSamjhoLauncher agreementId="agr:a" contentHash="sha256:a" analysisVersion="v1" agreementText="Sample agreement text." language="en" />,
  )
  const kannadaMarkup = renderToStaticMarkup(
    <AskSamjhoLauncher agreementId="agr:a" contentHash="sha256:a" analysisVersion="v1" agreementText="Sample agreement text." language="kn" />,
  )
  assert.ok(englishMarkup.includes('Ask Samjho'))
  assert.ok(kannadaMarkup.includes('ಸಮ್ಝೊವನ್ನು ಕೇಳಿ'))
})
