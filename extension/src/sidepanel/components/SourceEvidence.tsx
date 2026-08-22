import React from 'react'
const LONG_TEXT_THRESHOLD = 220

export function SourceEvidence({ sourceText }: { sourceText: string }) {
  const isLong = sourceText.length > LONG_TEXT_THRESHOLD

  if (!isLong) {
    return (
      <div className="samjho-source">
        <p className="samjho-source__label">Source clause</p>
        <blockquote className="samjho-source__quote">{sourceText}</blockquote>
      </div>
    )
  }

  return (
    <details className="samjho-source samjho-source--collapsible">
      <summary className="samjho-source__label">Source clause</summary>
      <blockquote className="samjho-source__quote">{sourceText}</blockquote>
    </details>
  )
}
