import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { canonicalizeUrl, computeAgreementId } from './agreementId'

test('scheme and hostname casing canonicalize to the same source', () => {
  const upper = canonicalizeUrl('HTTPS://Example.com/terms')
  const lower = canonicalizeUrl('https://example.com/terms')
  assert.equal(upper, lower)
})

test('fragments are ignored by default under the documented fragment policy', () => {
  const a = canonicalizeUrl('https://example.com/terms#section1')
  const b = canonicalizeUrl('https://example.com/terms#section2')
  assert.equal(a, b)
})

test('fragments are preserved when explicitly requested', () => {
  const a = canonicalizeUrl('https://example.com/terms#section1', 'include')
  const b = canonicalizeUrl('https://example.com/terms#section2', 'include')
  assert.notEqual(a, b)
})

test('query parameters are preserved and can distinguish documents', () => {
  const a = canonicalizeUrl('https://example.com/terms?version=1')
  const b = canonicalizeUrl('https://example.com/terms?version=2')
  assert.notEqual(a, b)
})

test('default ports are stripped from the canonical source', () => {
  const withPort = canonicalizeUrl('https://example.com:443/terms')
  const withoutPort = canonicalizeUrl('https://example.com/terms')
  assert.equal(withPort, withoutPort)
})

test('different paths produce different agreement ids', async () => {
  const terms = canonicalizeUrl('https://example.com/terms')
  const privacy = canonicalizeUrl('https://example.com/privacy')
  assert.ok(terms && privacy)
  const termsId = await computeAgreementId(terms!)
  const privacyId = await computeAgreementId(privacy!)
  assert.notEqual(termsId, privacyId)
})

test('same canonical source produces the same agreement id', async () => {
  const a = canonicalizeUrl('HTTPS://example.com/terms#section1')
  const b = canonicalizeUrl('https://example.com/terms#section2')
  assert.ok(a && b)
  const idA = await computeAgreementId(a!)
  const idB = await computeAgreementId(b!)
  assert.equal(idA, idB)
})

test('agreement id is a stable, self-describing string', async () => {
  const id = await computeAgreementId('https://example.com/terms')
  assert.match(id, /^agr:[0-9a-f]{32}$/)
})
