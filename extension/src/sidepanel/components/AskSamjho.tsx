import React, { useState } from 'react'
import type { SupportedLanguage } from '../../shared/analysisRequestTypes'
import { useChat } from '../state/useChat'
import { UI_TEXT } from '../uiText'
import { ChatMessageItem } from './ChatMessageItem'

export function AskSamjho({
  agreementId,
  contentHash,
  analysisVersion,
  agreementText,
  language,
}: {
  agreementId: string
  contentHash: string
  analysisVersion: string
  agreementText: string
  language: SupportedLanguage
}) {
  const { messages, pending, error, ask } = useChat({ agreementId, contentHash, analysisVersion, agreementText, language })
  const [draft, setDraft] = useState('')
  const text = UI_TEXT[language]

  function submit(question: string): void {
    setDraft('')
    void ask(question)
  }

  return (
    <div className="samjho-ask-samjho-body">
      {messages.length === 0 ? (
        <div className="samjho-chat-suggestions" role="group" aria-label="Suggested questions">
          {text.chatSuggestedQuestions.map((question) => (
            <button key={question} type="button" className="samjho-button samjho-chat-suggestion" onClick={() => submit(question)}>
              {question}
            </button>
          ))}
        </div>
      ) : null}

      <div className="samjho-chat-messages" role="log" aria-live="polite">
        {messages.map((message) => (
          <ChatMessageItem key={message.id} message={message} language={language} />
        ))}
        {pending ? <p className="samjho-chat-pending">{text.chatPendingText}</p> : null}
      </div>

      {error ? (
        <p className="samjho-chat-error" role="alert">
          {error}
        </p>
      ) : null}

      <form
        className="samjho-chat-input"
        onSubmit={(event) => {
          event.preventDefault()
          if (draft.trim()) submit(draft)
        }}
      >
        <input
          type="text"
          className="samjho-chat-input__field"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={text.chatInputPlaceholder}
          aria-label={text.chatInputPlaceholder}
          disabled={pending}
        />
        <button type="submit" className="samjho-button samjho-chat-input__send" disabled={pending || !draft.trim()}>
          {text.chatSendButton}
        </button>
      </form>
    </div>
  )
}
