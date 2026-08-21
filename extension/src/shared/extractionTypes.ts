export type AgreementSourceType =
  | 'samePage'
  | 'modal'
  | 'accordion'
  | 'sameOriginLink'
  | 'externalLink'
  | 'newTabLink'
  | 'pdf'

export type ExtractionStatus = 'READY' | 'PARTIAL' | 'UNRESOLVED' | 'FAILED'

export type SourceReference = {
  strategy: string
  headingPath: string[]
  containerDescriptor: string
}

export type AgreementExtractionResult = {
  candidateId: string
  sourceType: AgreementSourceType
  title: string
  sourceUrl?: string
  resolvedUrl?: string
  originalText: string
  normalizedText: string
  sourceReference: SourceReference
  confidence: 'high' | 'medium' | 'low'
  extractionStatus: ExtractionStatus
  extractionWarnings: string[]
  extractedAt: number
}
