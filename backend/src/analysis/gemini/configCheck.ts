import { env } from '../../config/env.js'

export type GeminiConfigCheck = {
  apiKeyPresent: boolean
  model: string
  valid: boolean
}

export function getGeminiConfigCheck(): GeminiConfigCheck {
  const apiKeyPresent = typeof env.gemini.apiKey === 'string' && env.gemini.apiKey.length > 0
  const modelPresent = typeof env.gemini.model === 'string' && env.gemini.model.length > 0
  return {
    apiKeyPresent,
    model: env.gemini.model,
    valid: apiKeyPresent && modelPresent,
  }
}
