import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { PublicUser, SupportedLanguage } from '../api/types.js'
import { UI_TEXT } from '../uiText.js'
import { LanguageTabs } from './LanguageTabs.js'

export function Navbar({
  language,
  onLanguageChange,
  user,
  onLogout,
  onOpenHistory,
  onOpenAuth,
  onGoHome,
}: {
  language: SupportedLanguage
  onLanguageChange: (language: SupportedLanguage) => void
  user: PublicUser | null
  onLogout: () => Promise<void>
  onOpenHistory: () => void
  onOpenAuth: () => void
  onGoHome: () => void
}) {
  const reduceMotion = useReducedMotion()
  const text = UI_TEXT[language]

  return (
    <motion.header
      className="samjho-navbar samjho-glass"
      initial={reduceMotion ? false : { opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <button type="button" className="samjho-navbar__brand" onClick={onGoHome} aria-label={text.goHomeAriaLabel}>
        <img src="/samjho-logo.png" alt="" className="samjho-navbar__logo" />
        <span className="samjho-navbar__name">Samjho</span>
      </button>

      <div className="samjho-navbar__right">
        <LanguageTabs selected={language} onSelect={onLanguageChange} />

        {user ? (
          <div className="samjho-navbar__account">
            <button type="button" className="samjho-button samjho-navbar__history" onClick={onOpenHistory}>
              {text.historyNavButton}
            </button>
            <span className="samjho-navbar__email">{user.email}</span>
            <button type="button" className="samjho-button samjho-navbar__logout" onClick={() => void onLogout()}>
              {text.logoutButton}
            </button>
          </div>
        ) : (
          <button type="button" className="samjho-button samjho-button--primary samjho-navbar__login" onClick={onOpenAuth}>
            {text.loginTab}
          </button>
        )}
      </div>
    </motion.header>
  )
}
