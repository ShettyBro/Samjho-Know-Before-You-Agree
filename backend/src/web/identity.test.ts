import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { computeWebAgreementId, computeWebContentHash, normalizeWebText } from './identity.js'

test('identical pasted text produces the same content hash', () => {
  const hashA = computeWebContentHash(normalizeWebText('Your subscription renews automatically each month.'))
  const hashB = computeWebContentHash(normalizeWebText('Your subscription renews automatically each month.'))
  assert.equal(hashA, hashB)
})

test('different pasted text produces a different content hash', () => {
  const hashA = computeWebContentHash(normalizeWebText('Your subscription renews automatically each month.'))
  const hashB = computeWebContentHash(normalizeWebText('You may cancel at any time without penalty.'))
  assert.notEqual(hashA, hashB)
})

test('whitespace-only differences do not change the content hash', () => {
  const hashA = computeWebContentHash(normalizeWebText('Line one.\nLine two.'))
  const hashB = computeWebContentHash(normalizeWebText('Line one.   \n   Line two.  '))
  assert.equal(hashA, hashB)
})

test('CRLF and LF line endings produce the same content hash', () => {
  const hashA = computeWebContentHash(normalizeWebText('Line one.\r\nLine two.'))
  const hashB = computeWebContentHash(normalizeWebText('Line one.\nLine two.'))
  assert.equal(hashA, hashB)
})

test('the same content hash produces the same agreementId for the same source type', () => {
  const hash = computeWebContentHash(normalizeWebText('Sample agreement text.'))
  const idA = computeWebAgreementId('pastedText', hash)
  const idB = computeWebAgreementId('pastedText', hash)
  assert.equal(idA, idB)
})

test('the same content hash produces a different agreementId for a different source type', () => {
  const hash = computeWebContentHash(normalizeWebText('Sample agreement text.'))
  const pastedId = computeWebAgreementId('pastedText', hash)
  const pdfId = computeWebAgreementId('pdf', hash)
  assert.notEqual(pastedId, pdfId)
})

test('the content hash is a self-describing string', () => {
  const hash = computeWebContentHash(normalizeWebText('Sample agreement text.'))
  assert.ok(hash.startsWith('sha256:'))
})

test('the agreementId is a self-describing string', () => {
  const hash = computeWebContentHash(normalizeWebText('Sample agreement text.'))
  const id = computeWebAgreementId('pastedText', hash)
  assert.ok(id.startsWith('agr:'))
})
