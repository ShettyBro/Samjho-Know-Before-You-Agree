import React from 'react'
import type { AttentionItemPayload } from '../../shared/analysisResultTypes'
import { AttentionItemCard } from './AttentionItemCard'

const IMPORTANCE_RANK: Record<'high' | 'medium' | 'low', number> = { high: 0, medium: 1, low: 2 }

export function AttentionItemsList({ items }: { items: AttentionItemPayload[] }) {
  if (items.length === 0) return null

  const sorted = [...items].sort((a, b) => IMPORTANCE_RANK[a.importance] - IMPORTANCE_RANK[b.importance])

  return (
    <section className="samjho-section" aria-labelledby="samjho-attention-heading">
      <h2 id="samjho-attention-heading" className="samjho-section__heading">
        Important things to know
      </h2>
      <ul className="samjho-attention-list">
        {sorted.map((item) => (
          <AttentionItemCard key={item.id} item={item} />
        ))}
      </ul>
    </section>
  )
}
