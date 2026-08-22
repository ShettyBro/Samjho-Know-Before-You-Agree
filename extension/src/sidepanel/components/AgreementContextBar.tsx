import React from 'react'
import type { AgreementContext } from '../state/types'
import { formatSourceLocation } from '../format'
import { SOURCE_TYPE_LABELS } from '../labels'

export function AgreementContextBar({ agreement }: { agreement: AgreementContext }) {
  const location = formatSourceLocation(agreement.sourceUrl)

  return (
    <div className="samjho-context">
      <p className="samjho-context__title">{agreement.title}</p>
      <p className="samjho-context__meta">
        {SOURCE_TYPE_LABELS[agreement.sourceType] ?? 'Linked document'}
        {location ? ` · ${location}` : ''}
      </p>
    </div>
  )
}
