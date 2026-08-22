import { apiRequest, type ApiOutcome } from './client.js'
import { isWebAnalyzeResponse, type SupportedLanguage, type WebAnalyzeResponse } from './types.js'

export async function analyzePastedText(text: string, language: SupportedLanguage): Promise<ApiOutcome<WebAnalyzeResponse>> {
  return apiRequest(
    '/api/v1/agreements/web/text',
    { method: 'POST', body: JSON.stringify({ text, language }) },
    isWebAnalyzeResponse,
  )
}

export async function analyzePdf(file: File, language: SupportedLanguage): Promise<ApiOutcome<WebAnalyzeResponse>> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('language', language)
  return apiRequest('/api/v1/agreements/web/pdf', { method: 'POST', body: formData }, isWebAnalyzeResponse)
}
