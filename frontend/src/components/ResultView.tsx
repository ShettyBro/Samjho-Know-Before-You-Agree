import React from 'react'
import type { AnalysisResultPayload, AttentionItemPayload, SupportedLanguage } from '../api/types.js'
import { UI_TEXT } from '../uiText.js'

const IMPORTANCE_RANK: Record<'high' | 'medium' | 'low', number> = { high: 0, medium: 1, low: 2 }
const IMPORTANCE_ICONS: Record<'high' | 'medium' | 'low', string> = { high: '●●●', medium: '●●', low: '●' }
const LONG_TEXT_THRESHOLD = 220

const SECTION_LABELS: Record<string, string> = {
  charges: 'Recurring charges',
  renewals: 'Automatic renewal',
  cancellation: 'Cancellation',
  dataSharing: 'Data sharing',
  disputeResolution: 'Dispute resolution',
  obligations: 'Obligations',
}

function SourceEvidence({ sourceText, label }: { sourceText: string; label: string }) {
  const isLong = sourceText.length > LONG_TEXT_THRESHOLD
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

function AttentionItemCard({ item, sourceLabel }: { item: AttentionItemPayload; sourceLabel: string }) {
  return (
    <li className="samjho-attention-item">
      <div className="samjho-attention-item__meta">
        <span className={`samjho-importance samjho-importance--${item.importance}`}>
          <span aria-hidden="true" className="samjho-importance__icon">
            {IMPORTANCE_ICONS[item.importance]}
          </span>
          <span>{item.importance} importance</span>
        </span>
        <span className="samjho-attention-item__category">{item.category}</span>
      </div>
      <h3 className="samjho-attention-item__title">{item.title}</h3>
      <p className="samjho-attention-item__explanation">{item.explanation}</p>
      {item.sourceText ? <SourceEvidence sourceText={item.sourceText} label={sourceLabel} /> : null}
    </li>
  )
}

export function ResultView({ result, language }: { result: AnalysisResultPayload; language: SupportedLanguage }) {
  const text = UI_TEXT[language]
  const sortedItems = [...result.attentionItems].sort((a, b) => IMPORTANCE_RANK[a.importance] - IMPORTANCE_RANK[b.importance])

  const sectionKeys: (keyof AnalysisResultPayload)[] = [
    'charges',
    'renewals',
    'cancellation',
    'dataSharing',
    'disputeResolution',
    'obligations',
  ]
  const availableSections = sectionKeys
    .map((key) => ({ key, section: result[key] as { available: boolean; summary: string[] } }))
    .filter(({ section }) => section.available)

  return (
    <div className="samjho-result">
      <p className="samjho-ready__status" role="status">
        {text.statusReady}
      </p>

      {result.summary.length > 0 ? (
        <section className="samjho-section" aria-labelledby="samjho-summary-heading">
          <h2 id="samjho-summary-heading" className="samjho-section__heading">
            {text.summaryHeading}
          </h2>
          <ul className="samjho-summary-list">
            {result.summary.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {sortedItems.length > 0 ? (
        <section className="samjho-section" aria-labelledby="samjho-attention-heading">
          <h2 id="samjho-attention-heading" className="samjho-section__heading">
            {text.attentionItemsHeading}
          </h2>
          <ul className="samjho-attention-list">
            {sortedItems.map((item) => (
              <AttentionItemCard key={item.id} item={item} sourceLabel={text.sourceClauseLabel} />
            ))}
          </ul>
        </section>
      ) : null}

      {availableSections.length > 0 ? (
        <section className="samjho-section" aria-labelledby="samjho-sections-heading">
          <h2 id="samjho-sections-heading" className="samjho-section__heading">
            {text.moreDetailHeading}
          </h2>
          <div className="samjho-derived-sections">
            {availableSections.map(({ key, section }) => (
              <div key={key} className="samjho-derived-section">
                <h3 className="samjho-derived-section__heading">{SECTION_LABELS[key] ?? key}</h3>
                <ul className="samjho-derived-section__list">
                  {section.summary.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {result.limitations.length > 0 ? (
        <ul className="samjho-limitations">
          {result.limitations.map((limitation, index) => (
            <li key={index}>{limitation}</li>
          ))}
        </ul>
      ) : null}

      <footer className="samjho-disclaimer" role="note">
        <p>{result.disclaimer || text.disclaimerFallback}</p>
      </footer>
    </div>
  )
}
