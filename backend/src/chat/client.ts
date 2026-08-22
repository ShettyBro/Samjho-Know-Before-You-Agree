import { GoogleGenAI } from '@google/genai'
import { env } from '../config/env.js'
import { assertGeminiConfigured, mapGeminiError } from '../analysis/gemini/client.js'
import { classifyGeminiError } from '../analysis/gemini/errorClassification.js'
import { ApiError } from '../analysis/errors.js'
import { buildChatSystemInstruction, buildChatUserContent, buildLanguageInstruction } from './prompt.js'
import { CHAT_RESPONSE_SCHEMA } from './schema.js'
import type { ChatMessage, ConfidenceLevel } from './types.js'
import type { SupportedLanguage } from '../analysis/types.js'

let client: GoogleGenAI | undefined

const PROVIDER_UNAVAILABLE_MESSAGE = "We couldn't answer that right now."

function getClient(): GoogleGenAI {
  assertGeminiConfigured(env.gemini.apiKey)
  if (!client) client = new GoogleGenAI({ apiKey: env.gemini.apiKey })
  return client
}

export type ChatModelResponse = {
  answer: string
  sourceText: string
  sourceReference: { sectionTitle: string; sourceIndex: string }
  confidence: ConfidenceLevel
  notFound: boolean
}

export async function requestChatAnswer(
  agreementText: string,
  history: ChatMessage[],
  question: string,
  language: SupportedLanguage,
): Promise<ChatModelResponse> {
  const ai = getClient()
  const startedAt = Date.now()

  let response: Awaited<ReturnType<typeof ai.models.generateContent>>
  try {
    response = await ai.models.generateContent({
      model: env.gemini.model,
      contents: buildChatUserContent(agreementText, history, question),
      config: {
        systemInstruction: `${buildChatSystemInstruction()} ${buildLanguageInstruction(language)}`,
        responseMimeType: 'application/json',
        responseSchema: CHAT_RESPONSE_SCHEMA,
        temperature: 0.2,
        topP: 0.9,
        httpOptions: {
          timeout: env.gemini.timeoutMs,
          retryOptions: { attempts: env.gemini.retryAttempts },
        },
      },
    })
  } catch (error) {
    const classification = classifyGeminiError(error)
    console.error('[Samjho] chat provider error', {
      provider: 'gemini',
      model: env.gemini.model,
      elapsedMs: Date.now() - startedAt,
      category: classification.category,
      httpStatus: classification.httpStatus,
      providerCode: classification.providerCode,
      requestId: classification.requestId,
    })
    throw mapGeminiError(error)
  }

  const text = response.text
  if (!text) {
    console.error('[Samjho] chat provider error', {
      provider: 'gemini',
      model: env.gemini.model,
      elapsedMs: Date.now() - startedAt,
      category: 'PROVIDER_ERROR',
    })
    throw new ApiError('PROVIDER_ERROR', 502, PROVIDER_UNAVAILABLE_MESSAGE)
  }

  try {
    return JSON.parse(text) as ChatModelResponse
  } catch {
    console.error('[Samjho] chat provider error', {
      provider: 'gemini',
      model: env.gemini.model,
      elapsedMs: Date.now() - startedAt,
      category: 'SCHEMA_ERROR',
    })
    throw new ApiError('ANALYSIS_SCHEMA_ERROR', 502, 'The chat provider returned a response that could not be parsed')
  }
}
