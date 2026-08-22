import React from 'react'
import type { AnalysisResultPayload } from '../../shared/analysisResultTypes'
import { SECTION_LABELS, type DerivedSectionKey } from '../labels'

const SECTION_KEYS: DerivedSectionKey[] = ['charges', 'renewals', 'cancellation', 'dataSharing', 'disputeResolution', 'obligations']

export function DerivedSections({ result }: { result: AnalysisResultPayload }) {
  const availableSections = SECTION_KEYS.map((key) => ({ key, section: result[key] })).filter(({ section }) => section.available)

  if (availableSections.length === 0) return null

  return (
    <section className="samjho-section" aria-labelledby="samjho-sections-heading">
      <h2 id="samjho-sections-heading" className="samjho-section__heading">
        More detail
      </h2>
      <div className="samjho-derived-sections">
        {availableSections.map(({ key, section }) => (
          <div key={key} className="samjho-derived-section">
            <h3 className="samjho-derived-section__heading">{SECTION_LABELS[key]}</h3>
            <ul className="samjho-derived-section__list">
              {section.summary.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
