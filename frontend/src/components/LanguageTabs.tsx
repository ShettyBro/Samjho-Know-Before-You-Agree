import React from 'react'
import type { SupportedLanguage } from '../api/types.js'

const LANGUAGES: { code: SupportedLanguage; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'hi', label: 'हिन्दी' },
]

export function LanguageTabs({ selected, onSelect }: { selected: SupportedLanguage; onSelect: (language: SupportedLanguage) => void }) {
  return (
    <div className="samjho-language-tabs" role="tablist" aria-label="Language">
      {LANGUAGES.map((entry) => {
        const isSelected = entry.code === selected
        return (
          <button
            key={entry.code}
            type="button"
            role="tab"
            aria-selected={isSelected}
            className={isSelected ? 'samjho-language-tab samjho-language-tab--selected' : 'samjho-language-tab'}
            onClick={() => onSelect(entry.code)}
          >
            {entry.label}
          </button>
        )
      })}
    </div>
  )
}
