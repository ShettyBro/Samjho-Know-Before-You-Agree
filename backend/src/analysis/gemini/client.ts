import { GoogleGenAI } from '@google/genai'
import { env } from '../../config/env.js'
import { ApiError } from '../errors.js'
import { classifyGeminiError } from './errorClassification.js'
import { buildSystemInstruction, buildUserContent } from './prompt.js'
import { GEMINI_RESPONSE_SCHEMA } from './schema.js'
import type { GeminiContentPayload } from './types.js'

let client: GoogleGenAI | undefined

const PROVIDER_UNAVAILABLE_MESSAGE = 'The analysis provider is temporarily unavailable.'

export function assertGeminiConfigured(apiKey: string | undefined): void {
  if (!apiKey) {
    console.error('[Samjho] gemini provider error', {
      provider: 'gemini',
      model: env.gemini.model,
      elapsedMs: 0,
      category: 'CONFIGURATION_ERROR',
    })
    throw new ApiError('PROVIDER_ERROR', 502, PROVIDER_UNAVAILABLE_MESSAGE)
  }
}

export function mapGeminiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error
  return new ApiError('PROVIDER_ERROR', 502, PROVIDER_UNAVAILABLE_MESSAGE)
}

function getClient(): GoogleGenAI {
  assertGeminiConfigured(env.gemini.apiKey)
  if (!client) client = new GoogleGenAI({ apiKey: env.gemini.apiKey })
  return client
}

export async function requestChunkAnalysis(chunkText: string): Promise<GeminiContentPayload> {
  const ai = getClient()
  const startedAt = Date.now()

  let response: Awaited<ReturnType<typeof ai.models.generateContent>>
  try {
    response = await ai.models.generateContent({
      model: env.gemini.model,
      contents: buildUserContent(chunkText),
      config: {
        systemInstruction: buildSystemInstruction(),
        responseMimeType: 'application/json',
        responseSchema: GEMINI_RESPONSE_SCHEMA,
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
    console.error('[Samjho] gemini provider error', {
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
    console.error('[Samjho] gemini provider error', {
      provider: 'gemini',
      model: env.gemini.model,
      elapsedMs: Date.now() - startedAt,
      category: 'PROVIDER_ERROR',
    })
    throw new ApiError('PROVIDER_ERROR', 502, PROVIDER_UNAVAILABLE_MESSAGE)
  }

  try {
    return JSON.parse(text) as GeminiContentPayload
  } catch {
    console.error('[Samjho] gemini provider error', {
      provider: 'gemini',
      model: env.gemini.model,
      elapsedMs: Date.now() - startedAt,
      category: 'SCHEMA_ERROR',
    })
    throw new ApiError('ANALYSIS_SCHEMA_ERROR', 502, 'The analysis provider returned a response that could not be parsed')
  }
}
