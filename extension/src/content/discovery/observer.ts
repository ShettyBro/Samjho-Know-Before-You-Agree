import { isSamjhoOwned } from '../../shared/dom'
import type { CandidateSource, ConsentCandidate } from '../../shared/discoveryTypes'
import { scanRoot } from './elementScan'
import { CandidateRegistry } from './registry'

const DEBOUNCE_MS = 250

export class DiscoveryEngine {
  private registry = new CandidateRegistry()
  private pendingRoots = new Set<Element>()
  private debounceTimer: ReturnType<typeof setTimeout> | undefined
  private readonly onChange: (candidates: ConsentCandidate[]) => void

  constructor(onChange: (candidates: ConsentCandidate[]) => void) {
    this.onChange = onChange
  }

  start(): void {
    this.runInitialScan()

    const observer = new MutationObserver((mutations) => this.handleMutations(mutations))
    observer.observe(document.body, { childList: true, subtree: true })

    const scheduleNavigationRescan = () => {
      this.pendingRoots.add(document.body)
      this.scheduleFlush('navigation')
    }
    window.addEventListener('popstate', scheduleNavigationRescan)
    window.addEventListener('hashchange', scheduleNavigationRescan)

    const originalPushState = history.pushState.bind(history)
    history.pushState = ((...args: Parameters<History['pushState']>) => {
      originalPushState(...args)
      scheduleNavigationRescan()
    }) as History['pushState']

    const originalReplaceState = history.replaceState.bind(history)
    history.replaceState = ((...args: Parameters<History['replaceState']>) => {
      originalReplaceState(...args)
      scheduleNavigationRescan()
    }) as History['replaceState']
  }

  private runInitialScan(): void {
    const drafts = scanRoot(document.body)
    if (this.registry.upsert(drafts, 'initialScan')) this.onChange(this.registry.list())
  }

  private handleMutations(mutations: MutationRecord[]): void {
    let relevant = false
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof Element) || isSamjhoOwned(node)) continue
        this.pendingRoots.add(node)
        relevant = true
      }
      if (mutation.removedNodes.length > 0) relevant = true
    }
    if (relevant) this.scheduleFlush('mutation')
  }

  private scheduleFlush(source: CandidateSource): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer)
    this.debounceTimer = setTimeout(() => this.flush(source), DEBOUNCE_MS)
  }

  private flush(source: CandidateSource): void {
    const roots = Array.from(this.pendingRoots)
    this.pendingRoots.clear()
    const drafts = roots.flatMap((root) => scanRoot(root))
    if (this.registry.upsert(drafts, source)) this.onChange(this.registry.list())
  }
}
