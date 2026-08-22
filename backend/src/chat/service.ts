import type { SupportedLanguage } from '../analysis/types.js'
import { ApiError } from '../analysis/errors.js'
import type { ValidationResult } from '../analysis/validationResult.js'
import { requestChatAnswer, type ChatModelResponse } from './client.js'
import { CHAT_DISCLAIMERS, UNVERIFIED_MESSAGES } from './limits.js'
import { validateChatRequest } from './requestValidation.js'
import { validateChatModelResponse } from './responseValidation.js'
import type { ChatMessage, ChatResult } from './types.js'
import { isGrounded } from './verifyGrounding.js'

export type ChatAnswerFn = (
  agreementText: string,
  history: ChatMessage[],
  question: string,
  language: SupportedLanguage,
) => Promise<ChatModelResponse>

export async function answerChatQuestion(
  rawRequest: unknown,
  requestAnswer: ChatAnswerFn = requestChatAnswer,
): Promise<ValidationResult<ChatResult>> {
  const requestValidation = validateChatRequest(rawRequest)
  if (!requestValidation.ok) return requestValidation
  const request = requestValidation.value

  let rawResponse: unknown
  try {
    rawResponse = await requestAnswer(request.agreementText, request.history, request.question, request.language)
  } catch (error) {
    const apiError = error instanceof ApiError ? error : new ApiError('PROVIDER_ERROR', 502, "We couldn't answer that right now.")
    return { ok: false, error: apiError }
  }

  const responseValidation = validateChatModelResponse(rawResponse)
  if (!responseValidation.ok) return responseValidation
  const modelResponse = responseValidation.value

  if (modelResponse.notFound) {
    return {
      ok: true,
      value: {
        agreementId: request.agreementId,
        contentHash: request.contentHash,
        analysisVersion: request.analysisVersion,
        answer: modelResponse.answer,
        sourceText: '',
        sourceReference: null,
        confidence: modelResponse.confidence,
        notFound: true,
        disclaimer: CHAT_DISCLAIMERS[request.language],
      },
    }
  }

  if (!isGrounded(modelResponse.sourceText, request.agreementText)) {
    return {
      ok: true,
      value: {
        agreementId: request.agreementId,
        contentHash: request.contentHash,
        analysisVersion: request.analysisVersion,
        answer: UNVERIFIED_MESSAGES[request.language],
        sourceText: '',
        sourceReference: null,
        confidence: 'low',
        notFound: true,
        disclaimer: CHAT_DISCLAIMERS[request.language],
      },
    }
  }

  return {
    ok: true,
    value: {
      agreementId: request.agreementId,
      contentHash: request.contentHash,
      analysisVersion: request.analysisVersion,
      answer: modelResponse.answer,
      sourceText: modelResponse.sourceText,
      sourceReference: modelResponse.sourceReference,
      confidence: modelResponse.confidence,
      notFound: false,
      disclaimer: CHAT_DISCLAIMERS[request.language],
    },
  }
}
