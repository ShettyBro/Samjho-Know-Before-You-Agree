import React from 'react'
import type { SupportedLanguage } from '../../shared/analysisRequestTypes'
import { UI_TEXT } from '../uiText'

export function SummarySection({ summary, language }: { summary: string[]; language: SupportedLanguage }) {
  if (summary.length === 0) return null

  return (
    <section className="samjho-section" aria-labelledby="samjho-summary-heading">
      <h2 id="samjho-summary-heading" className="samjho-section__heading">
        {UI_TEXT[language].summaryHeading}
      </h2>
      <ul className="samjho-summary-list">
        {summary.map((point, index) => (
          <li key={index} className="samjho-summary-list__item">
            {point}
          </li>
        ))}
      </ul>
    </section>
  )
}
