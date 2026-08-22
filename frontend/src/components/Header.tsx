import React from 'react'
import type { SupportedLanguage } from '../api/types.js'
import { UI_TEXT } from '../uiText.js'

export function Header({ language }: { language: SupportedLanguage }) {
  return (
    <header className="samjho-header">
      <div className="samjho-header__mark" aria-hidden="true">
        S
      </div>
      <div>
        <h1 className="samjho-header__title">Samjho</h1>
        <p className="samjho-header__tagline">{UI_TEXT[language].tagline}</p>
      </div>
    </header>
  )
}
