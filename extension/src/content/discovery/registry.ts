import type { CandidateSource, ConsentCandidate } from '../../shared/discoveryTypes'
import type { CandidateDraft } from './elementScan'
import type { LiveCandidate } from './types'
import { scoreSignals, scoreToConfidence } from './matching'

function computeFingerprint(draft: CandidateDraft): string {
  const parts = draft.matchedSignals
    .map((signal) => `${signal.kind}:${signal.category}:${signal.matchedText.trim().toLowerCase()}`)
    .sort()
  return `${draft.elementType}|${parts.join(',')}`
}

export class CandidateRegistry {
  private entries = new Map<string, LiveCandidate>()

  upsert(drafts: CandidateDraft[], source: CandidateSource): boolean {
    const now = Date.now()
    const touched = new Set<string>()
    let changed = false

    for (const draft of drafts) {
      const candidateId = computeFingerprint(draft)
      touched.add(candidateId)

      const existing = this.entries.get(candidateId)
      if (existing) {
        existing.element = draft.element
        existing.lastSeenAt = now
        continue
      }

      const score = scoreSignals(draft.matchedSignals)
      this.entries.set(candidateId, {
        candidateId,
        elementType: draft.elementType,
        matchedText: draft.matchedText,
        matchedSignals: draft.matchedSignals,
        associatedLinks: draft.associatedLinks,
        targetUrl: draft.targetUrl,
        confidence: scoreToConfidence(score),
        confidenceScore: score,
        source,
        firstSeenAt: now,
        lastSeenAt: now,
        element: draft.element,
      })
      changed = true
    }

    for (const [candidateId, candidate] of this.entries) {
      if (touched.has(candidateId)) continue
      if (!candidate.element.isConnected) {
        this.entries.delete(candidateId)
        changed = true
      }
    }

    return changed
  }

  list(): ConsentCandidate[] {
    return Array.from(this.entries.values()).map(({ element: _element, ...candidate }) => candidate)
  }
}
