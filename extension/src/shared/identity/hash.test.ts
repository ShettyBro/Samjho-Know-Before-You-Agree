import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { computeContentHash, HASH_ALGORITHM, NORMALIZATION_VERSION } from './hash'

test('identical text produces the same content hash', async () => {
  const a = await computeContentHash('Agreement text A')
  const b = await computeContentHash('Agreement text A')
  assert.equal(a.hash, b.hash)
})

test('whitespace-only variation produces the same content hash', async () => {
  const a = await computeContentHash('Terms   of Service')
  const b = await computeContentHash('Terms of Service')
  assert.equal(a.hash, b.hash)
})

test('CRLF vs LF line endings produce the same content hash', async () => {
  const a = await computeContentHash('Line one\r\nLine two')
  const b = await computeContentHash('Line one\nLine two')
  assert.equal(a.hash, b.hash)
})

test('capitalization changes the content hash under the documented case-sensitive policy', async () => {
  const a = await computeContentHash('Terms of Service')
  const b = await computeContentHash('TERMS OF SERVICE')
  assert.notEqual(a.hash, b.hash)
})

test('punctuation changes the content hash under the documented punctuation-sensitive policy', async () => {
  const a = await computeContentHash('You agree.')
  const b = await computeContentHash('You agree')
  assert.notEqual(a.hash, b.hash)
})

test('equivalent Unicode representations normalize to the same content hash', async () => {
  const precomposed = `caf${String.fromCharCode(0xe9)}`
  const decomposed = `caf${String.fromCharCode(0x65)}${String.fromCharCode(0x301)}`
  assert.notEqual(precomposed, decomposed)
  assert.equal(precomposed.normalize('NFC'), decomposed.normalize('NFC'))
  const a = await computeContentHash(precomposed)
  const b = await computeContentHash(decomposed)
  assert.equal(a.hash, b.hash)
})

test('identical Kannada text produces the same content hash', async () => {
  const text = 'ನೀವು ಈ ನಿಯಮಗಳಿಗೆ ಒಪ್ಪುತ್ತೀರಿ.'
  const a = await computeContentHash(text)
  const b = await computeContentHash(text)
  assert.equal(a.hash, b.hash)
})

test('identical Hindi text produces the same content hash', async () => {
  const text = 'आप इन शर्तों से सहमत हैं।'
  const a = await computeContentHash(text)
  const b = await computeContentHash(text)
  assert.equal(a.hash, b.hash)
})

test('mixed-language text is preserved and deterministic', async () => {
  const kannada = 'ನೀವು ಈ ನಿಯಮಗಳಿಗೆ ಒಪ್ಪುತ್ತೀರಿ.'
  const hindi = 'आप इन शर्तों से सहमत हैं।'
  const text = `English text.\n${kannada}\n${hindi}`
  const a = await computeContentHash(text)
  const b = await computeContentHash(text)
  assert.equal(a.hash, b.hash)
  assert.ok(a.canonical.includes(kannada))
  assert.ok(a.canonical.includes(hindi))
})

test('meaningful content change produces a different content hash', async () => {
  const a = await computeContentHash('Your subscription renews monthly.')
  const b = await computeContentHash('Your subscription renews annually.')
  assert.notEqual(a.hash, b.hash)
})

test('normalization version and hash algorithm are stable constants', () => {
  assert.equal(NORMALIZATION_VERSION, 'v1')
  assert.equal(HASH_ALGORITHM, 'SHA-256')
})

test('content hash is a self-describing hex string', async () => {
  const { hash } = await computeContentHash('Sample agreement text')
  assert.match(hash, /^sha256:[0-9a-f]{64}$/)
})
