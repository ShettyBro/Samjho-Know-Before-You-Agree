import { apiRequest, type ApiOutcome } from './client.js'
import { isChatResultPayload, type ChatMessage, type ChatResultPayload, type SupportedLanguage } from './types.js'

export async function askSamjho(input: {
  agreementId: string
  contentHash: string
  analysisVersion: string
  agreementText: string
  question: string
  language: SupportedLanguage
  history: ChatMessage[]
}): Promise<ApiOutcome<ChatResultPayload>> {
  return apiRequest('/api/v1/agreements/chat', { method: 'POST', body: JSON.stringify(input) }, isChatResultPayload)
}
