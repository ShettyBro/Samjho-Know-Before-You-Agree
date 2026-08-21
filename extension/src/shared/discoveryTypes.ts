export type TermCategory = 'terms' | 'privacy' | 'payment' | 'subscription' | 'consent' | 'agreementAction'

export type SignalKind =
  | 'linkText'
  | 'href'
  | 'buttonText'
  | 'checkboxLabel'
  | 'ariaLabel'
  | 'title'
  | 'heading'
  | 'nearbyText'
  | 'visibleText'

export type MatchedSignal = {
  kind: SignalKind
  category: TermCategory
  matchedText: string
}

export type ConfidenceLevel = 'high' | 'medium' | 'low'

export type CandidateElementType = 'link' | 'button' | 'checkbox' | 'heading' | 'text'

export type CandidateSource = 'initialScan' | 'mutation' | 'navigation'

export type AssociatedLink = { text: string; url: string }

export type ConsentCandidate = {
  candidateId: string
  elementType: CandidateElementType
  matchedText: string
  matchedSignals: MatchedSignal[]
  associatedLinks: AssociatedLink[]
  targetUrl?: string
  confidence: ConfidenceLevel
  confidenceScore: number
  source: CandidateSource
  firstSeenAt: number
  lastSeenAt: number
}
