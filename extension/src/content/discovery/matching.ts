import type { MatchedSignal, SignalKind } from '../../shared/discoveryTypes'
import { phrasePatterns, urlPatterns, wholeWordPatterns } from './vocabulary'

const MAX_WHOLE_WORD_LENGTH = 40

function normalizeLabel(text: string): string {
  return text
    .trim()
    .replace(/[\s»:.\-–—>]+$/u, '')
    .replace(/^[\s»:.\-–—<]+/u, '')
}

function matchPhrases(text: string, kind: SignalKind): MatchedSignal[] {
  const signals: MatchedSignal[] = []
  for (const pattern of phrasePatterns) {
    const match = text.match(pattern.regex)
    if (match) signals.push({ kind, category: pattern.category, matchedText: match[0] })
  }
  return signals
}

function matchWholeWord(text: string, kind: SignalKind): MatchedSignal[] {
  const normalized = normalizeLabel(text)
  if (normalized.length === 0 || normalized.length > MAX_WHOLE_WORD_LENGTH) return []
  const signals: MatchedSignal[] = []
  for (const pattern of wholeWordPatterns) {
    if (pattern.regex.test(normalized)) {
      signals.push({ kind, category: pattern.category, matchedText: normalized })
    }
  }
  return signals
}

export function matchLabelText(text: string, kind: SignalKind): MatchedSignal[] {
  return [...matchPhrases(text, kind), ...matchWholeWord(text, kind)]
}

export function matchBodyText(text: string, kind: SignalKind): MatchedSignal[] {
  return matchPhrases(text, kind)
}

export function matchUrlPath(href: string, baseUrl: string): MatchedSignal[] {
  let path: string
  try {
    path = new URL(href, baseUrl).pathname
  } catch {
    return []
  }
  const signals: MatchedSignal[] = []
  for (const pattern of urlPatterns) {
    if (pattern.regex.test(path)) {
      signals.push({ kind: 'href', category: pattern.category, matchedText: path })
    }
  }
  return signals
}

const SIGNAL_WEIGHTS: Record<SignalKind, number> = {
  linkText: 2,
  href: 2,
  buttonText: 3,
  checkboxLabel: 3,
  ariaLabel: 2,
  title: 1,
  heading: 1,
  nearbyText: 2,
  visibleText: 1,
}

export function scoreSignals(signals: MatchedSignal[]): number {
  const seen = new Set<string>()
  let score = 0
  for (const signal of signals) {
    const key = `${signal.kind}:${signal.category}:${signal.matchedText.toLowerCase()}`
    if (seen.has(key)) continue
    seen.add(key)
    score += SIGNAL_WEIGHTS[signal.kind]
  }
  return score
}

export function scoreToConfidence(score: number): 'high' | 'medium' | 'low' {
  if (score >= 4) return 'high'
  if (score >= 2) return 'medium'
  return 'low'
}
