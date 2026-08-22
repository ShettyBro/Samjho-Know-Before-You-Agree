import React from 'react'
import type { SupportedLanguage } from '../../shared/analysisRequestTypes'
import { UI_TEXT } from '../uiText'

const LONG_TEXT_THRESHOLD = 220

export function SourceEvidence({ sourceText, language }: { sourceText: string; language: SupportedLanguage }) {
  const isLong = sourceText.length > LONG_TEXT_THRESHOLD
  const label = UI_TEXT[language].sourceClauseLabel

  if (!isLong) {
    return (
      <div className="samjho-source">
        <p className="samjho-source__label">{label}</p>
        <blockquote className="samjho-source__quote">{sourceText}</blockquote>
      </div>
    )
  }

  return (
    <details className="samjho-source samjho-source--collapsible">
      <summary className="samjho-source__label">{label}</summary>
      <blockquote className="samjho-source__quote">{sourceText}</blockquote>
    </details>
  )
}
