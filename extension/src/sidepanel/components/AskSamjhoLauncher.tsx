import React, { useState } from 'react'
import type { SupportedLanguage } from '../../shared/analysisRequestTypes'
import { UI_TEXT } from '../uiText'
import { AskSamjho } from './AskSamjho'

export function AskSamjhoLauncher({
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
  const [open, setOpen] = useState(false)
  const text = UI_TEXT[language]

  return (
    <>
      <button
        type="button"
        className="samjho-chat-launcher"
        aria-expanded={open}
        aria-label={text.askSamjhoHeading}
        onClick={() => setOpen((current) => !current)}
      >
        <span aria-hidden="true" className="samjho-chat-launcher__icon">
          💬
        </span>
      </button>

      {open ? (
        <div className="samjho-chat-overlay" role="dialog" aria-label={text.askSamjhoHeading}>
          <div className="samjho-chat-overlay__header">
            <h2 className="samjho-chat-overlay__heading">{text.askSamjhoHeading}</h2>
            <button
              type="button"
              className="samjho-chat-overlay__close"
              aria-label={text.closeButtonAriaLabel}
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </div>
          <AskSamjho
            agreementId={agreementId}
            contentHash={contentHash}
            analysisVersion={analysisVersion}
            agreementText={agreementText}
            language={language}
          />
        </div>
      ) : null}
    </>
  )
}
