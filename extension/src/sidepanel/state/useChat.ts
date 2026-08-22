import { useEffect, useRef, useState } from 'react'
import type { SupportedLanguage } from '../../shared/analysisRequestTypes'
import type { ChatConfidenceLevel, ChatMessage, ChatSourceReference } from '../../shared/chatTypes'
import { sendRequest } from '../../shared/rpc'

const MAX_HISTORY_SENT = 8
const CHAT_TIMEOUT_MS = 20000
const GENERIC_CHAT_FAILURE_MESSAGE = "Samjho couldn't answer that right now."

export type DisplayChatMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
  sourceText?: string
  sourceReference?: ChatSourceReference | null
  confidence?: ChatConfidenceLevel
  notFound?: boolean
  disclaimer?: string
}

export function useChat(params: {
  agreementId: string
  contentHash: string
  analysisVersion: string
  agreementText: string
  language: SupportedLanguage
}) {
  const { agreementId, contentHash, analysisVersion, agreementText, language } = params
  const [messages, setMessages] = useState<DisplayChatMessage[]>([])
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesRef = useRef<DisplayChatMessage[]>([])
  messagesRef.current = messages

  useEffect(() => {
    setMessages([])
    setError(null)
    setPending(false)
  }, [agreementId, contentHash])

  async function ask(question: string): Promise<void> {
    const trimmed = question.trim()
    if (!trimmed || pending) return

    const history: ChatMessage[] = messagesRef.current
      .slice(-MAX_HISTORY_SENT)
      .map((message) => ({ role: message.role, text: message.text }))

    const userMessage: DisplayChatMessage = { id: crypto.randomUUID(), role: 'user', text: trimmed }
    setMessages((current) => [...current, userMessage])
    setError(null)
    setPending(true)

    const response = await sendRequest(
      'sidepanel',
      {
        type: 'CHAT_REQUEST',
        request: { agreementId, contentHash, analysisVersion, question: trimmed, language, agreementText, history },
      },
      CHAT_TIMEOUT_MS,
    )

    setPending(false)

    if (response.ok && response.payload.type === 'CHAT_RESPONSE') {
      const result = response.payload.result
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: result.answer,
          sourceText: result.sourceText,
          sourceReference: result.sourceReference,
          confidence: result.confidence,
          notFound: result.notFound,
          disclaimer: result.disclaimer,
        },
      ])
      return
    }

    const message = response.payload.type === 'ERROR' ? response.payload.message : GENERIC_CHAT_FAILURE_MESSAGE
    setError(message)
  }

  return { messages, pending, error, ask }
}
