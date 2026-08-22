import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { ApiError } from '../analysis/errors.js'
import { answerChatQuestion } from './service.js'
import type { ChatModelResponse } from './client.js'

const AGREEMENT_TEXT =
  'Your subscription renews automatically every month. You may cancel from account settings before the next renewal date. Refunds are unavailable after a billing cycle begins.'

function baseRequest(overrides: Record<string, unknown> = {}) {
  return {
    agreementId: 'agr:a',
    contentHash: 'sha256:a',
    analysisVersion: 'v1',
    question: 'Will this renew automatically?',
    language: 'en',
    agreementText: AGREEMENT_TEXT,
    history: [],
    ...overrides,
  }
}

function fakeAnswer(response: ChatModelResponse) {
  return async () => response
}

test('a valid question returns a structured, grounded response', async () => {
  const answer: ChatModelResponse = {
    answer: 'Yes, your subscription renews automatically every month.',
    sourceText: 'Your subscription renews automatically every month.',
    sourceReference: { sectionTitle: '', sourceIndex: '0' },
    confidence: 'high',
    notFound: false,
  }
  const result = await answerChatQuestion(baseRequest(), fakeAnswer(answer))
  assert.equal(result.ok, true)
  if (result.ok) {
    assert.equal(result.value.notFound, false)
    assert.equal(result.value.sourceText, answer.sourceText)
    assert.equal(result.value.agreementId, 'agr:a')
    assert.equal(result.value.contentHash, 'sha256:a')
  }
})

test('the returned result always echoes the requested agreement identity, never another agreement', async () => {
  const answer: ChatModelResponse = {
    answer: 'Yes, your subscription renews automatically every month.',
    sourceText: 'Your subscription renews automatically every month.',
    sourceReference: { sectionTitle: '', sourceIndex: '0' },
    confidence: 'high',
    notFound: false,
  }
  const result = await answerChatQuestion(baseRequest({ agreementId: 'agr:b', contentHash: 'sha256:b' }), fakeAnswer(answer))
  assert.equal(result.ok, true)
  if (result.ok) {
    assert.equal(result.value.agreementId, 'agr:b')
    assert.equal(result.value.contentHash, 'sha256:b')
  }
})

test('missing agreement context is rejected before any provider call', async () => {
  let called = false
  const result = await answerChatQuestion(baseRequest({ agreementId: '' }), async () => {
    called = true
    throw new Error('should not be called')
  })
  assert.equal(result.ok, false)
  assert.equal(called, false)
})

test('an ungrounded sourceText is never presented as evidence; the answer is marked notFound', async () => {
  const answer: ChatModelResponse = {
    answer: 'You will be charged a $500 penalty.',
    sourceText: 'This exact sentence does not appear anywhere in the agreement.',
    sourceReference: { sectionTitle: '', sourceIndex: '0' },
    confidence: 'high',
    notFound: false,
  }
  const result = await answerChatQuestion(baseRequest(), fakeAnswer(answer))
  assert.equal(result.ok, true)
  if (result.ok) {
    assert.equal(result.value.notFound, true)
    assert.equal(result.value.sourceText, '')
  }
})

test('a model response that explicitly says the agreement lacks the information is passed through as notFound', async () => {
  const answer: ChatModelResponse = {
    answer: 'The agreement does not specify a refund percentage.',
    sourceText: '',
    sourceReference: { sectionTitle: '', sourceIndex: '0' },
    confidence: 'low',
    notFound: true,
  }
  const result = await answerChatQuestion(baseRequest({ question: 'What percentage refund do I get?' }), fakeAnswer(answer))
  assert.equal(result.ok, true)
  if (result.ok) {
    assert.equal(result.value.notFound, true)
    assert.equal(result.value.answer, answer.answer)
  }
})

test('a malformed model response never becomes a successful chat answer', async () => {
  const result = await answerChatQuestion(baseRequest(), async () => ({ nonsense: true }) as unknown as ChatModelResponse)
  assert.equal(result.ok, false)
})

test('a provider failure returns a safe, generic error rather than a raw provider message', async () => {
  const result = await answerChatQuestion(baseRequest(), async () => {
    throw new ApiError('PROVIDER_ERROR', 502, "We couldn't answer that right now.")
  })
  assert.equal(result.ok, false)
  if (!result.ok) {
    assert.equal(result.error.code, 'PROVIDER_ERROR')
    assert.ok(!result.error.message.toLowerCase().includes('gemini'))
  }
})

test('the requested language is forwarded to the chat provider call', async () => {
  const answer: ChatModelResponse = {
    answer: 'ಹೌದು, ಇದು ಪ್ರತಿ ತಿಂಗಳು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ನವೀಕರಣಗೊಳ್ಳುತ್ತದೆ.',
    sourceText: 'Your subscription renews automatically every month.',
    sourceReference: { sectionTitle: '', sourceIndex: '0' },
    confidence: 'high',
    notFound: false,
  }
  let receivedLanguage: string | undefined
  const result = await answerChatQuestion(baseRequest({ language: 'kn' }), async (_agreementText, _history, _question, language) => {
    receivedLanguage = language
    return answer
  })
  assert.equal(receivedLanguage, 'kn')
  assert.equal(result.ok, true)
})

test('an unexpected thrown error from the provider is still mapped to a safe PROVIDER_ERROR', async () => {
  const result = await answerChatQuestion(baseRequest(), async () => {
    throw new Error('ECONNRESET raw network failure detail')
  })
  assert.equal(result.ok, false)
  if (!result.ok) {
    assert.equal(result.error.code, 'PROVIDER_ERROR')
    assert.ok(!result.error.message.includes('ECONNRESET'))
  }
})
