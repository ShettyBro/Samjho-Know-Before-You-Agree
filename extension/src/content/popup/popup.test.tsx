import React from 'react'
import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { Affordance } from './Affordance'
import { POPUP_LABELS } from './labels'
import { Popup } from './Popup'

test('the popup renders the title, body, and understand button for the selected language', () => {
  const markup = renderToStaticMarkup(
    <Popup language="en" onSelectLanguage={() => undefined} onUnderstandMore={() => undefined} onClose={() => undefined} />,
  )
  assert.ok(markup.includes(POPUP_LABELS.en.title))
  assert.ok(markup.includes('Samjho can explain what this agreement means'))
  assert.ok(markup.includes('Understand') && markup.includes('See More'))
})

test('switching the selected language replaces the entire popup content with that language', () => {
  const markup = renderToStaticMarkup(
    <Popup language="kn" onSelectLanguage={() => undefined} onUnderstandMore={() => undefined} onClose={() => undefined} />,
  )
  assert.ok(markup.includes(POPUP_LABELS.kn.title))
  assert.ok(markup.includes(POPUP_LABELS.kn.body))
  assert.ok(markup.includes(POPUP_LABELS.kn.understandButton))
  assert.ok(!markup.includes(POPUP_LABELS.en.title))
})

test('exactly one language tab is marked selected', () => {
  const markup = renderToStaticMarkup(
    <Popup language="hi" onSelectLanguage={() => undefined} onUnderstandMore={() => undefined} onClose={() => undefined} />,
  )
  const selectedMatches = markup.match(/aria-selected="true"/g) ?? []
  assert.equal(selectedMatches.length, 1)
  assert.ok(markup.includes('हिन्दी'))
})

test('the popup always renders a close control', () => {
  const markup = renderToStaticMarkup(
    <Popup language="en" onSelectLanguage={() => undefined} onUnderstandMore={() => undefined} onClose={() => undefined} />,
  )
  assert.ok(markup.includes(POPUP_LABELS.en.closeButtonAriaLabel))
})

test('the affordance renders the provided label', () => {
  const markup = renderToStaticMarkup(<Affordance label="Learn about this agreement" onClick={() => undefined} />)
  assert.ok(markup.includes('Learn about this agreement'))
})
