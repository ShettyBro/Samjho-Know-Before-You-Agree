import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { computeAffordancePosition, findVisibleRect, type RectSource } from './position'

const VIEWPORT = { width: 1200, height: 800 }
const HOST_SIZE = { width: 220, height: 32 }

test('the affordance anchors just below the action element by default', () => {
  const targetRect = { top: 100, left: 50, bottom: 130, right: 150 }
  const position = computeAffordancePosition(targetRect, HOST_SIZE, VIEWPORT)
  assert.equal(position.top, 136)
  assert.equal(position.left, 50)
})

test('the affordance flips above the action element when there is no room below it in the viewport', () => {
  const targetRect = { top: 770, left: 50, bottom: 795, right: 150 }
  const position = computeAffordancePosition(targetRect, HOST_SIZE, VIEWPORT)
  assert.equal(position.top, 770 - HOST_SIZE.height - 6)
})

test('the affordance never renders left of the viewport, even for an element flush against the edge', () => {
  const targetRect = { top: 100, left: -50, bottom: 130, right: 10 }
  const position = computeAffordancePosition(targetRect, HOST_SIZE, VIEWPORT)
  assert.ok(position.left >= 6)
})

test('the affordance never renders past the right edge of the viewport', () => {
  const targetRect = { top: 100, left: 1150, bottom: 130, right: 1250 }
  const position = computeAffordancePosition(targetRect, HOST_SIZE, VIEWPORT)
  assert.ok(position.left + HOST_SIZE.width <= VIEWPORT.width)
})

test('the affordance never renders above the top of the viewport', () => {
  const targetRect = { top: -100, left: 50, bottom: -70, right: 150 }
  const position = computeAffordancePosition(targetRect, HOST_SIZE, VIEWPORT)
  assert.ok(position.top >= 6)
})

test('the affordance never renders below the bottom of the viewport', () => {
  const targetRect = { top: 2000, left: 50, bottom: 2030, right: 150 }
  const position = computeAffordancePosition(targetRect, HOST_SIZE, VIEWPORT)
  assert.ok(position.top + HOST_SIZE.height <= VIEWPORT.height)
})

test('positioning never defaults to a fixed bottom-left placement unrelated to the action element', () => {
  const targetRect = { top: 300, left: 400, bottom: 330, right: 500 }
  const position = computeAffordancePosition(targetRect, HOST_SIZE, VIEWPORT)
  assert.notEqual(position.left, 20)
  assert.ok(Math.abs(position.left - targetRect.left) < 50)
})

function node(rect: { top: number; left: number; bottom: number; right: number }, parent: RectSource | null = null): RectSource {
  return { getBoundingClientRect: () => ({ ...rect, width: rect.right - rect.left, height: rect.bottom - rect.top }), parentElement: parent }
}

test('findVisibleRect returns the element own rect when it already has a nonzero size', () => {
  const element = node({ top: 100, left: 50, bottom: 130, right: 150 })
  const rect = findVisibleRect(element)
  assert.equal(rect?.width, 100)
  assert.equal(rect?.height, 30)
})

test('findVisibleRect walks up to the nearest ancestor with a rendered size when the element itself is zero-sized', () => {
  const visibleWrapper = node({ top: 200, left: 80, bottom: 232, right: 180 })
  const invisibleInner = node({ top: 0, left: 0, bottom: 0, right: 0 }, visibleWrapper)
  const semanticButton = node({ top: 0, left: 0, bottom: 0, right: 0 }, invisibleInner)

  const rect = findVisibleRect(semanticButton)
  assert.equal(rect?.top, 200)
  assert.equal(rect?.left, 80)
  assert.equal(rect?.width, 100)
})

test('findVisibleRect gives up and returns null when no ancestor within the level limit has any size', () => {
  const allZero = node({ top: 0, left: 0, bottom: 0, right: 0 })
  const alsoZero = node({ top: 0, left: 0, bottom: 0, right: 0 }, allZero)
  const target = node({ top: 0, left: 0, bottom: 0, right: 0 }, alsoZero)

  const rect = findVisibleRect(target, 1)
  assert.equal(rect, null)
})
