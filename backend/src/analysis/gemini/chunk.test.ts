import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { MAX_CHUNKS, MAX_CHUNK_CHARS, splitForProcessing } from './chunk.js'

test('short text stays as a single chunk', () => {
  const { chunks, truncated } = splitForProcessing('A short agreement.\n\nWith two paragraphs.')
  assert.equal(chunks.length, 1)
  assert.equal(truncated, false)
})

test('long text is split at paragraph boundaries rather than mid-sentence', () => {
  const paragraph = 'This is one clause of the agreement repeated to build length. '.repeat(200)
  const text = Array.from({ length: 3 }, () => paragraph).join('\n\n')
  const { chunks } = splitForProcessing(text)
  assert.ok(chunks.length > 1)
  for (const chunk of chunks) {
    assert.ok(chunk.length <= MAX_CHUNK_CHARS)
  }
})

test('an extremely long document is truncated in a controlled way rather than processed without limit', () => {
  const hugeParagraph = 'Clause text. '.repeat(20000)
  const text = Array.from({ length: 20 }, () => hugeParagraph).join('\n\n')
  const { chunks, truncated } = splitForProcessing(text)
  assert.ok(chunks.length <= MAX_CHUNKS)
  assert.equal(truncated, true)
})
