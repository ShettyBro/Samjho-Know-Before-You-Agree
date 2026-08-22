import React from 'react'
import type { SupportedLanguage } from '../../shared/analysisRequestTypes'

const LANGUAGES: { code: SupportedLanguage; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'hi', label: 'हिन्दी' },
]

export function LanguageTabs({
  selected,
  onSelect,
}: {
  selected: SupportedLanguage
  onSelect: (language: SupportedLanguage) => void
}) {
  return (
    <div className="samjho-language-tabs" role="tablist" aria-label="Side panel language">
      {LANGUAGES.map((language) => {
        const isSelected = language.code === selected
        return (
          <button
            key={language.code}
            type="button"
            role="tab"
            aria-selected={isSelected}
            className={isSelected ? 'samjho-language-tab samjho-language-tab--selected' : 'samjho-language-tab'}
            onClick={() => onSelect(language.code)}
          >
            {language.label}
          </button>
        )
      })}
    </div>
  )
}
