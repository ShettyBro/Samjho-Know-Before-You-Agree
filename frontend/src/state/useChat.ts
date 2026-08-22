import { useEffect, useRef, useState } from 'react'
import { askSamjho } from '../api/chat.js'
import type { ChatMessage, ChatResultPayload, SupportedLanguage } from '../api/types.js'

const MAX_HISTORY_SENT = 8
const GENERIC_CHAT_FAILURE_MESSAGE = "Samjho couldn't answer that right now."

export type DisplayChatMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
  sourceText?: string
  confidence?: ChatResultPayload['confidence']
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

    const outcome = await askSamjho({ agreementId, contentHash, analysisVersion, agreementText, question: trimmed, language, history })

    setPending(false)

    if (outcome.ok) {
      const result = outcome.value
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: result.answer,
          sourceText: result.sourceText,
          confidence: result.confidence,
          notFound: result.notFound,
          disclaimer: result.disclaimer,
        },
      ])
      return
    }

    setError(outcome.error.message || GENERIC_CHAT_FAILURE_MESSAGE)
  }

  return { messages, pending, error, ask }
}
