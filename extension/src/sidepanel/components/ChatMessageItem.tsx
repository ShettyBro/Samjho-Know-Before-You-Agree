import React from 'react'
import type { SupportedLanguage } from '../../shared/analysisRequestTypes'
import type { DisplayChatMessage } from '../state/useChat'
import { UI_TEXT } from '../uiText'
import { SourceEvidence } from './SourceEvidence'

export function ChatMessageItem({ message, language }: { message: DisplayChatMessage; language: SupportedLanguage }) {
  const isAssistant = message.role === 'assistant'

  return (
    <div className={isAssistant ? 'samjho-chat-message samjho-chat-message--assistant' : 'samjho-chat-message samjho-chat-message--user'}>
      <p className="samjho-chat-message__text">{message.text}</p>
      {isAssistant && message.sourceText ? <SourceEvidence sourceText={message.sourceText} language={language} /> : null}
      {isAssistant ? (
        <button type="button" className="samjho-button samjho-chat-message__listen" disabled aria-label="Listen to this answer">
          {UI_TEXT[language].chatListenButton}
        </button>
      ) : null}
    </div>
  )
}
