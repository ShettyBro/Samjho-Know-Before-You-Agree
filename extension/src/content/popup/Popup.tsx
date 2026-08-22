import React from 'react'
import type { SupportedLanguage } from '../../shared/analysisRequestTypes'
import { POPUP_LABELS } from './labels'

const LANGUAGES: { code: SupportedLanguage; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'hi', label: 'हिन्दी' },
]

export function Popup({
  language,
  onSelectLanguage,
  onUnderstandMore,
  onClose,
}: {
  language: SupportedLanguage
  onSelectLanguage: (language: SupportedLanguage) => void
  onUnderstandMore: () => void
  onClose: () => void
}) {
  const labels = POPUP_LABELS[language]

  return (
    <div className="samjho-popup" role="dialog" aria-modal="false" aria-label={labels.title}>
      <div className="samjho-popup-header">
        <div className="samjho-popup-languages" role="tablist" aria-label={labels.languageTablistAriaLabel}>
          {LANGUAGES.map((entry) => {
            const isSelected = entry.code === language
            return (
              <button
                key={entry.code}
                type="button"
                role="tab"
                aria-selected={isSelected}
                className={isSelected ? 'samjho-popup-language samjho-popup-language--selected' : 'samjho-popup-language'}
                onClick={() => onSelectLanguage(entry.code)}
              >
                {entry.label}
              </button>
            )
          })}
        </div>
        <button type="button" className="samjho-popup-close" aria-label={labels.closeButtonAriaLabel} onClick={onClose}>
          ×
        </button>
      </div>
      <div className="samjho-popup-body">
        <p className="samjho-popup-title">{labels.title}</p>
        <p className="samjho-popup-text">{labels.body}</p>
      </div>
      <div className="samjho-popup-actions">
        <button type="button" className="samjho-popup-understand" onClick={onUnderstandMore}>
          {labels.understandButton}
        </button>
      </div>
    </div>
  )
}
