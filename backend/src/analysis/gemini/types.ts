export type GeminiSourceReferencePayload = {
  sectionTitle: string
  sourceIndex: string
}

export type GeminiAttentionItemPayload = {
  category: string
  importance: string
  title: string
  explanation: string
  sourceText: string
  sourceReference: GeminiSourceReferencePayload
}

export type GeminiContentPayload = {
  summary: string[]
  attentionItems: GeminiAttentionItemPayload[]
}
