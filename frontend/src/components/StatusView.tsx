import React from 'react'
import type { SupportedLanguage } from '../api/types.js'
import { UI_TEXT } from '../uiText.js'
import type { AnalysisState } from '../state/analysisTypes.js'

export function StatusView({
  state,
  language,
  onRetry,
}: {
  state: AnalysisState
  language: SupportedLanguage
  onRetry: () => void
}) {
  const text = UI_TEXT[language]

  if (state.kind === 'IDLE') return null

  if (state.kind === 'INPUT_ERROR') {
    return (
      <p className="samjho-status__body samjho-status__body--error" role="alert">
        {state.message}
      </p>
    )
  }

  if (state.kind === 'ERROR') {
    return (
      <div className="samjho-status samjho-status--error" role="alert">
        <h2 className="samjho-status__heading">{text.statusErrorHeading}</h2>
        <p className="samjho-status__body">{state.message}</p>
        <button type="button" className="samjho-button samjho-button--primary" onClick={onRetry}>
          {text.retryButton}
        </button>
      </div>
    )
  }

  const heading =
    state.kind === 'UPLOADING'
      ? text.statusUploading
      : state.kind === 'EXTRACTING'
        ? text.statusExtracting
        : state.kind === 'PREPARING'
          ? text.statusPreparing
          : text.statusPrefetching

  return (
    <div className="samjho-status" role="status" aria-live="polite">
      <span className="samjho-loading" aria-hidden="true">
        <span className="samjho-loading__dot" />
        <span className="samjho-loading__dot" />
        <span className="samjho-loading__dot" />
      </span>
      <p className="samjho-status__body">{heading}</p>
    </div>
  )
}
