import type { SupportedLanguage } from '../analysis/types.js'

export type ChatRole = 'user' | 'assistant'

export type ChatMessage = {
  role: ChatRole
  text: string
}

export type ChatRequest = {
  agreementId: string
  contentHash: string
  analysisVersion: string
  question: string
  language: SupportedLanguage
  agreementText: string
  history: ChatMessage[]
}

export type ConfidenceLevel = 'high' | 'medium' | 'low'

export type ChatSourceReference = {
  sectionTitle: string
  sourceIndex: string
}

export type ChatResult = {
  agreementId: string
  contentHash: string
  analysisVersion: string
  answer: string
  sourceText: string
  sourceReference: ChatSourceReference | null
  confidence: ConfidenceLevel
  notFound: boolean
  disclaimer: string
}
