import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import type { AgreementExtractionResult } from '../../shared/extractionTypes'
import type { AgreementIdentityResult } from '../../shared/identityTypes'
import { findPairByAgreementId, pairExtractionsWithIdentities, pickCurrentAgreement } from './pairCandidates'

function extraction(overrides: Partial<AgreementExtractionResult> = {}): AgreementExtractionResult {
  return {
    candidateId: 'candidate-1',
    sourceType: 'samePage',
    title: 'Conditions of Use',
    originalText: 'You agree to these conditions.',
    normalizedText: 'you agree to these conditions.',
    sourceReference: { strategy: 'link', headingPath: [], containerDescriptor: '' },
    confidence: 'high',
    extractionStatus: 'READY',
    extractionWarnings: [],
    extractedAt: Date.now(),
    ...overrides,
  }
}

function identity(overrides: Partial<AgreementIdentityResult> = {}): AgreementIdentityResult {
  return {
    agreementId: 'agr:candidate-1',
    contentHash: 'sha256:candidate-1',
    canonicalSource: 'https://example.com/conditions',
    sourceType: 'samePage',
    candidateId: 'candidate-1',
    normalizationVersion: 'v1',
    hashAlgorithm: 'sha256',
    hashInputLength: 30,
    identityWarnings: [],
    computedAt: Date.now(),
    ...overrides,
  }
}

test('an extraction and identity for the same candidate are paired even when their arrays are out of order', () => {
  const extractions = [
    extraction({ candidateId: 'candidate-2', title: 'Privacy Notice' }),
    extraction({ candidateId: 'candidate-1', title: 'Conditions of Use' }),
  ]
  const identities = [
    identity({ candidateId: 'candidate-1', agreementId: 'agr:candidate-1' }),
    identity({ candidateId: 'candidate-2', agreementId: 'agr:candidate-2' }),
  ]

  const paired = pairExtractionsWithIdentities(extractions, identities)

  assert.equal(paired.length, 2)
  const privacyPair = paired.find((pair) => pair.extraction.candidateId === 'candidate-2')
  assert.equal(privacyPair?.identity.agreementId, 'agr:candidate-2')
  const conditionsPair = paired.find((pair) => pair.extraction.candidateId === 'candidate-1')
  assert.equal(conditionsPair?.identity.agreementId, 'agr:candidate-1')
})

test('two Amazon-like agreements (Conditions of Use and Privacy Notice) remain independent, not merged', () => {
  const extractions = [
    extraction({ candidateId: 'conditions', title: 'Conditions of Use' }),
    extraction({ candidateId: 'privacy', title: 'Privacy Notice' }),
  ]
  const identities = [
    identity({ candidateId: 'conditions', agreementId: 'agr:conditions', contentHash: 'sha256:conditions' }),
    identity({ candidateId: 'privacy', agreementId: 'agr:privacy', contentHash: 'sha256:privacy' }),
  ]

  const paired = pairExtractionsWithIdentities(extractions, identities)

  assert.equal(paired.length, 2)
  assert.notEqual(paired[0].identity.agreementId, paired[1].identity.agreementId)
  assert.notEqual(paired[0].identity.contentHash, paired[1].identity.contentHash)
})

test('an extraction whose identity has not arrived yet is not paired and does not crash the lookup', () => {
  const extractions = [extraction({ candidateId: 'candidate-1' }), extraction({ candidateId: 'candidate-2' })]
  const identities = [identity({ candidateId: 'candidate-1' })]

  const paired = pairExtractionsWithIdentities(extractions, identities)

  assert.equal(paired.length, 1)
  assert.equal(paired[0].extraction.candidateId, 'candidate-1')
})

test('an identity for a candidate whose extraction has since disappeared is silently dropped, not misassigned', () => {
  const extractions = [extraction({ candidateId: 'candidate-1' })]
  const identities = [identity({ candidateId: 'candidate-1' }), identity({ candidateId: 'stale-candidate' })]

  const paired = pairExtractionsWithIdentities(extractions, identities)

  assert.equal(paired.length, 1)
  assert.equal(paired[0].identity.candidateId, 'candidate-1')
})

test('populated background tab state with a high-confidence extraction yields a usable agreement, not an empty result', () => {
  const paired = pairExtractionsWithIdentities([extraction()], [identity()])
  const agreement = pickCurrentAgreement(paired)

  assert.ok(agreement)
  assert.equal(agreement?.agreementId, 'agr:candidate-1')
  assert.equal(agreement?.contentHash, 'sha256:candidate-1')
})

test('a low-confidence or unresolved extraction is not selected as the current agreement', () => {
  const paired = pairExtractionsWithIdentities(
    [extraction({ confidence: 'low', extractionStatus: 'FAILED' })],
    [identity()],
  )
  assert.equal(pickCurrentAgreement(paired), undefined)
})

test('findPairByAgreementId locates the correct extraction/identity pair by agreement identity, not array position', () => {
  const extractions = [extraction({ candidateId: 'a' }), extraction({ candidateId: 'b', title: 'Privacy' })]
  const identities = [identity({ candidateId: 'b', agreementId: 'agr:b' }), identity({ candidateId: 'a', agreementId: 'agr:a' })]
  const paired = pairExtractionsWithIdentities(extractions, identities)

  const found = findPairByAgreementId(paired, 'agr:a')
  assert.equal(found?.extraction.candidateId, 'a')
})
