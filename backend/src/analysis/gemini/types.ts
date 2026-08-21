export type GeminiSourceReferencePayload = {
  headingPath: string[]
  containerDescriptor: string
  sourceIndex: number
}

export type GeminiAttentionItemPayload = {
  id: string
  category: string
  importance: string
  confidence: string
  title: string
  explanation: string
  sourceText: string
  sourceReference: GeminiSourceReferencePayload
}

export type GeminiContentPayload = {
  summary: string[]
  attentionItems: GeminiAttentionItemPayload[]
  limitations: string[]
}
