import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { JSDOM } from 'jsdom'
import { isSamjhoOwned, isSamjhoWebApp, SAMJHO_OWNED_ATTRIBUTE } from './dom.js'

test('isSamjhoWebApp recognizes a page carrying the Samjho web-app meta marker', () => {
  const dom = new JSDOM('<html><head><meta name="samjho-web-app" content="true"></head><body></body></html>')
  assert.equal(isSamjhoWebApp(dom.window.document), true)
})

test('isSamjhoWebApp returns false for an ordinary page with no marker', () => {
  const dom = new JSDOM('<html><head></head><body><h1>Terms of Service</h1></body></html>')
  assert.equal(isSamjhoWebApp(dom.window.document), false)
})

test('isSamjhoOwned recognizes a node marked as Samjho-owned, and its descendants', () => {
  const dom = new JSDOM(`<body><div ${SAMJHO_OWNED_ATTRIBUTE}="true"><span id="child"></span></div><p id="unrelated"></p></body>`)
  ;(globalThis as unknown as { Element: unknown }).Element = dom.window.Element
  const child = dom.window.document.getElementById('child')!
  const unrelated = dom.window.document.getElementById('unrelated')!
  assert.equal(isSamjhoOwned(child), true)
  assert.equal(isSamjhoOwned(unrelated), false)
})
