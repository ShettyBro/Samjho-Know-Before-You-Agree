import React from 'react'
import { IMPORTANCE_LABELS } from '../labels'

const ICONS: Record<'high' | 'medium' | 'low', string> = {
  high: '●●●',
  medium: '●●',
  low: '●',
}

export function ImportanceBadge({ level }: { level: 'high' | 'medium' | 'low' }) {
  return (
    <span className={`samjho-importance samjho-importance--${level}`}>
      <span aria-hidden="true" className="samjho-importance__icon">
        {ICONS[level]}
      </span>
      <span>{IMPORTANCE_LABELS[level]} importance</span>
    </span>
  )
}
