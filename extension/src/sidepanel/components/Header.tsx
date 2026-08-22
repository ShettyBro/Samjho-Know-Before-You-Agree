import React from 'react'
import type { SupportedLanguage } from '../../shared/analysisRequestTypes'
import { UI_TEXT } from '../uiText'

export function Header({ language }: { language: SupportedLanguage }) {
  return (
    <header className="samjho-header">
      <img src="/samjho-logo.png" alt="" className="samjho-header__mark" />
      <div>
        <h1 className="samjho-header__title">Samjho</h1>
        <p className="samjho-header__tagline">{UI_TEXT[language].tagline}</p>
      </div>
    </header>
  )
}
