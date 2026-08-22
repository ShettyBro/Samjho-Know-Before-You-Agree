import React from 'react'
import type { SupportedLanguage } from '../api/types.js'
import type { DisplayChatMessage } from '../state/useChat.js'
import { UI_TEXT } from '../uiText.js'

export function ChatMessageItem({ message, language }: { message: DisplayChatMessage; language: SupportedLanguage }) {
  const isAssistant = message.role === 'assistant'
  const text = UI_TEXT[language]

  return (
    <div className={isAssistant ? 'samjho-chat-message samjho-chat-message--assistant' : 'samjho-chat-message samjho-chat-message--user'}>
      <p className="samjho-chat-message__text">{message.text}</p>
      {isAssistant && message.sourceText ? (
        <div className="samjho-source">
          <p className="samjho-source__label">{text.sourceClauseLabel}</p>
          <blockquote className="samjho-source__quote">{message.sourceText}</blockquote>
        </div>
      ) : null}
    </div>
  )
}
