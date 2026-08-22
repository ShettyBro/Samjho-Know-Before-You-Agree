import React from 'react'
import type { SupportedLanguage } from '../../shared/analysisRequestTypes'
import type { AttentionItemPayload } from '../../shared/analysisResultTypes'
import { CATEGORY_LABELS } from '../labels'
import { ImportanceBadge } from './ImportanceBadge'
import { SourceEvidence } from './SourceEvidence'

export function AttentionItemCard({ item, language }: { item: AttentionItemPayload; language: SupportedLanguage }) {
  return (
    <li className="samjho-attention-item">
      <div className="samjho-attention-item__meta">
        <ImportanceBadge level={item.importance} />
        <span className="samjho-attention-item__category">{CATEGORY_LABELS[item.category] ?? CATEGORY_LABELS.other}</span>
      </div>
      <h3 className="samjho-attention-item__title">{item.title}</h3>
      <p className="samjho-attention-item__explanation">{item.explanation}</p>
      {item.sourceText ? <SourceEvidence sourceText={item.sourceText} language={language} /> : null}
    </li>
  )
}
