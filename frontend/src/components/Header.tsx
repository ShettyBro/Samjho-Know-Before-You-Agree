import React from 'react'
import type { SupportedLanguage } from '../api/types.js'
import { UI_TEXT } from '../uiText.js'

export function Header({ language }: { language: SupportedLanguage }) {
  return (
    <header className="samjho-hero">
      <p className="samjho-hero__tagline">{UI_TEXT[language].tagline}</p>
    </header>
  )
}
