import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { JSDOM } from 'jsdom'
import type { ConsentCandidate } from '../../shared/discoveryTypes'

function installDom(html: string): void {
  const dom = new JSDOM(html, { url: 'https://example.com/' })
  const { window } = dom
  const globals = globalThis as unknown as Record<string, unknown>
  globals.window = window
  globals.document = window.document
  globals.Element = window.Element
  globals.Node = window.Node
  globals.HTMLElement = window.HTMLElement
  globals.HTMLInputElement = window.HTMLInputElement
  globals.HTMLAnchorElement = window.HTMLAnchorElement
  globals.MutationObserver = window.MutationObserver
  globals.history = window.history
  globals.CSS = window.CSS
}

function waitForDebounce(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 350))
}

test('an initial DOM scan discovers a real Terms of Service link as a high-confidence candidate', async () => {
  installDom('<body><a href="/terms">Terms of Service</a></body>')
  const { DiscoveryEngine } = await import('./observer.js')

  const updates: ConsentCandidate[][] = []
  new DiscoveryEngine((candidates) => updates.push(candidates)).start()

  assert.equal(updates.length, 1)
  assert.equal(updates[0].length, 1)
  assert.equal(updates[0][0].confidence, 'high')
})

test('a framework-style rerender that replaces a consent button does not leave a stale duplicate candidate', async () => {
  installDom('<body><button id="original">Accept Terms</button></body>')
  const { DiscoveryEngine } = await import('./observer.js')

  const updates: ConsentCandidate[][] = []
  const engine = new DiscoveryEngine((candidates) => updates.push(candidates))
  engine.start()
  assert.equal(updates[updates.length - 1].length, 1)

  const original = document.getElementById('original')!
  const replacement = document.createElement('button')
  replacement.id = 'replacement'
  replacement.textContent = 'Accept Terms'
  original.replaceWith(replacement)

  await waitForDebounce()

  const latest = updates[updates.length - 1]
  assert.equal(latest.length, 1)
})

test('two independent agreements discovered dynamically remain separate, not merged', async () => {
  installDom('<body><a href="/terms">Terms of Service</a></body>')
  const { DiscoveryEngine } = await import('./observer.js')

  const updates: ConsentCandidate[][] = []
  const engine = new DiscoveryEngine((candidates) => updates.push(candidates))
  engine.start()
  assert.equal(updates[updates.length - 1].length, 1)

  const privacyLink = document.createElement('a')
  privacyLink.setAttribute('href', '/privacy')
  privacyLink.textContent = 'Privacy Notice'
  document.body.appendChild(privacyLink)

  await waitForDebounce()

  const latest = updates[updates.length - 1]
  assert.equal(latest.length, 2)
  const categories = latest.flatMap((candidate) => candidate.matchedSignals.map((signal) => signal.category)).sort()
  assert.ok(categories.includes('terms'))
  assert.ok(categories.includes('privacy'))
})
