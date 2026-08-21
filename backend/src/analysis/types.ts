export type SourceType =
  | 'samePage'
  | 'modal'
  | 'accordion'
  | 'sameOriginLink'
  | 'externalLink'
  | 'newTabLink'
  | 'pdf'

export type SupportedLanguage = 'en' | 'kn' | 'hi'

export type AnalysisRequest = {
  agreementId: string
  contentHash: string
  sourceType: SourceType
  sourceUrl?: string
  resolvedUrl?: string
  normalizedText: string
  originalText: string
  analysisVersion: string
  language: SupportedLanguage
}

export type AttentionCategory =
  | 'recurringCharges'
  | 'autoRenewal'
  | 'fees'
  | 'dataCollection'
  | 'dataSharing'
  | 'thirdParties'
  | 'refundRestrictions'
  | 'cancellation'
  | 'disputeResolution'
  | 'accountTermination'
  | 'obligations'
  | 'authorizationConsent'
  | 'arbitration'
  | 'liability'
  | 'indemnification'
  | 'governingLaw'
  | 'deadline'
  | 'other'

export type ImportanceLevel = 'high' | 'medium' | 'low'

export type SourceReference = {
  headingPath: string[]
  containerDescriptor: string
  sourceIndex: number
  sourceUrl?: string
  sourceType: SourceType
}

export type AttentionItem = {
  id: string
  category: AttentionCategory
  importance: ImportanceLevel
  title: string
  explanation: string
  sourceReference: SourceReference
  sourceText: string
  confidence: ImportanceLevel
}

export type AnalysisSection = {
  available: boolean
  summary: string[]
  relatedAttentionItemIds: string[]
}

export type ProviderMetadata = {
  provider: string
  model: string
  generatedAt: string
  inputHash: string
  schemaVersion: string
}

export type AnalysisResult = {
  agreementId: string
  contentHash: string
  analysisVersion: string
  summary: string[]
  attentionItems: AttentionItem[]
  obligations: AnalysisSection
  charges: AnalysisSection
  renewals: AnalysisSection
  cancellation: AnalysisSection
  dataSharing: AnalysisSection
  disputeResolution: AnalysisSection
  limitations: string[]
  disclaimer: string
  generatedAt: string
  providerMetadata: ProviderMetadata
}
