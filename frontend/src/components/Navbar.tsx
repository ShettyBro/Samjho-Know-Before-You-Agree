import React, { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { PublicUser, SupportedLanguage } from '../api/types.js'
import { UI_TEXT } from '../uiText.js'
import { AuthModal } from './AuthModal.js'
import { LanguageTabs } from './LanguageTabs.js'

export function Navbar({
  language,
  onLanguageChange,
  user,
  authPending,
  authError,
  onLogin,
  onRegister,
  onLogout,
  onOpenHistory,
}: {
  language: SupportedLanguage
  onLanguageChange: (language: SupportedLanguage) => void
  user: PublicUser | null
  authPending: boolean
  authError: string | null
  onLogin: (email: string, password: string) => Promise<boolean>
  onRegister: (email: string, password: string) => Promise<boolean>
  onLogout: () => Promise<void>
  onOpenHistory: () => void
}) {
  const [authOpen, setAuthOpen] = useState(false)
  const reduceMotion = useReducedMotion()
  const text = UI_TEXT[language]

  return (
    <motion.header
      className="samjho-navbar samjho-glass"
      initial={reduceMotion ? false : { opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="samjho-navbar__brand">
        <img src="/samjho-logo.png" alt="" className="samjho-navbar__logo" />
        <span className="samjho-navbar__name">Samjho</span>
      </div>

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
          <button
            type="button"
            className="samjho-button samjho-button--primary samjho-navbar__login"
            onClick={() => setAuthOpen(true)}
          >
            {text.loginTab}
          </button>
        )}
      </div>

      <AnimatePresence>
        {authOpen ? (
          <AuthModal
            language={language}
            user={user}
            pending={authPending}
            error={authError}
            onLogin={async (email, password) => {
              const ok = await onLogin(email, password)
              if (ok) setAuthOpen(false)
              return ok
            }}
            onRegister={async (email, password) => {
              const ok = await onRegister(email, password)
              if (ok) setAuthOpen(false)
              return ok
            }}
            onLogout={onLogout}
            onClose={() => setAuthOpen(false)}
          />
        ) : null}
      </AnimatePresence>
    </motion.header>
  )
}
