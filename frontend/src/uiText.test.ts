import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { UI_TEXT } from './uiText.js'

test('every supported language defines the exact same set of UI text keys', () => {
  const [enKeys, knKeys, hiKeys] = [Object.keys(UI_TEXT.en).sort(), Object.keys(UI_TEXT.kn).sort(), Object.keys(UI_TEXT.hi).sort()]
  assert.deepEqual(enKeys, knKeys)
  assert.deepEqual(enKeys, hiKeys)
})

test('the tagline is translated distinctly for each language', () => {
  assert.notEqual(UI_TEXT.en.tagline, UI_TEXT.kn.tagline)
  assert.notEqual(UI_TEXT.en.tagline, UI_TEXT.hi.tagline)
  assert.notEqual(UI_TEXT.kn.tagline, UI_TEXT.hi.tagline)
})

test('the Ask Samjho heading is translated distinctly for each language', () => {
  assert.notEqual(UI_TEXT.en.askSamjhoHeading, UI_TEXT.kn.askSamjhoHeading)
  assert.notEqual(UI_TEXT.en.askSamjhoHeading, UI_TEXT.hi.askSamjhoHeading)
})

test('each language provides exactly three suggested chat questions', () => {
  assert.equal(UI_TEXT.en.chatSuggestedQuestions.length, 3)
  assert.equal(UI_TEXT.kn.chatSuggestedQuestions.length, 3)
  assert.equal(UI_TEXT.hi.chatSuggestedQuestions.length, 3)
})
