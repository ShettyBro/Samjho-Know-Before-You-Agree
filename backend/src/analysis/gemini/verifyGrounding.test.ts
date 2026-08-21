import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { filterGroundedItems } from './verifyGrounding.js'
import type { GeminiAttentionItemPayload } from './types.js'

function item(overrides: Partial<GeminiAttentionItemPayload>): GeminiAttentionItemPayload {
  return {
    id: 'a',
    category: 'autoRenewal',
    importance: 'high',
    confidence: 'high',
    title: 'Auto-renewal',
    explanation: 'The subscription renews automatically.',
    sourceText: 'Your subscription renews automatically each month.',
    sourceReference: { headingPath: [], containerDescriptor: 'paragraph', sourceIndex: 0 },
    ...overrides,
  }
}

test('an attention item whose sourceText appears verbatim in the analyzed text is kept', () => {
  const sourceText = 'Your subscription renews automatically each month. You may cancel anytime.'
  const { items, droppedCount } = filterGroundedItems([item({})], sourceText)
  assert.equal(items.length, 1)
  assert.equal(droppedCount, 0)
})

test('an attention item whose sourceText does not appear in the analyzed text is dropped, not silently accepted', () => {
  const sourceText = 'This agreement only discusses shipping timelines and nothing else.'
  const fabricated = item({ sourceText: 'You must pay a $500 cancellation penalty.' })
  const { items, droppedCount } = filterGroundedItems([fabricated], sourceText)
  assert.equal(items.length, 0)
  assert.equal(droppedCount, 1)
})

test('a mix of grounded and fabricated items keeps only the grounded ones', () => {
  const sourceText = 'You may cancel your subscription at any time from account settings.'
  const grounded = item({ sourceText: 'You may cancel your subscription at any time' })
  const fabricated = item({ id: 'b', sourceText: 'Arbitration must occur in a jurisdiction never mentioned here' })
  const { items, droppedCount } = filterGroundedItems([grounded, fabricated], sourceText)
  assert.equal(items.length, 1)
  assert.equal(items[0].id, 'a')
  assert.equal(droppedCount, 1)
})
