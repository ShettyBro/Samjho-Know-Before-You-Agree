import type { ConsentCandidate } from '../../shared/discoveryTypes'

export type LiveCandidate = ConsentCandidate & { element: Element }

export type {
  AssociatedLink,
  CandidateElementType,
  CandidateSource,
  ConfidenceLevel,
  ConsentCandidate,
  MatchedSignal,
  SignalKind,
  TermCategory,
} from '../../shared/discoveryTypes'
