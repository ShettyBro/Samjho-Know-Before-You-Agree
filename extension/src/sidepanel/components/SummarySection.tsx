import React from 'react'
export function SummarySection({ summary }: { summary: string[] }) {
  if (summary.length === 0) return null

  return (
    <section className="samjho-section" aria-labelledby="samjho-summary-heading">
      <h2 id="samjho-summary-heading" className="samjho-section__heading">
        Summary
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
