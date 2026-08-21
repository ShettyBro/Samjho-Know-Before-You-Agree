import { GoogleGenAI } from '@google/genai'
import { env } from '../../config/env.js'
import { ApiError } from '../errors.js'
import { buildSystemInstruction, buildUserContent } from './prompt.js'
import { GEMINI_RESPONSE_SCHEMA } from './schema.js'
import type { GeminiContentPayload } from './types.js'

let client: GoogleGenAI | undefined

export function assertGeminiConfigured(apiKey: string | undefined): void {
  if (!apiKey) {
    throw new ApiError('PROVIDER_ERROR', 502, 'The analysis provider is not configured')
  }
}

export function mapGeminiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error

  const status = typeof error === 'object' && error !== null ? (error as { status?: unknown }).status : undefined

  if (status === 401 || status === 403) {
    return new ApiError('PROVIDER_ERROR', 502, 'The analysis provider rejected the request credentials')
  }
  if (status === 404) {
    return new ApiError('PROVIDER_ERROR', 502, 'The configured analysis model is unavailable')
  }
  if (status === 429) {
    return new ApiError('PROVIDER_ERROR', 502, 'The analysis provider is currently rate-limited')
  }
  if (error instanceof Error && /timeout|aborted|deadline/i.test(error.message)) {
    return new ApiError('PROVIDER_ERROR', 502, 'The analysis provider did not respond in time')
  }
  return new ApiError('PROVIDER_ERROR', 502, 'The analysis provider failed to produce a result')
}

function getClient(): GoogleGenAI {
  assertGeminiConfigured(env.gemini.apiKey)
  if (!client) client = new GoogleGenAI({ apiKey: env.gemini.apiKey })
  return client
}

export async function requestChunkAnalysis(chunkText: string): Promise<GeminiContentPayload> {
  const ai = getClient()

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
    throw mapGeminiError(error)
  }

  const text = response.text
  if (!text) throw new ApiError('PROVIDER_ERROR', 502, 'The analysis provider returned an empty response')

  try {
    return JSON.parse(text) as GeminiContentPayload
  } catch {
    throw new ApiError('ANALYSIS_SCHEMA_ERROR', 502, 'The analysis provider returned a response that could not be parsed')
  }
}
