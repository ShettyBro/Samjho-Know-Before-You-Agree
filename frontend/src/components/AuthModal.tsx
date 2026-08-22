import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { PublicUser, SupportedLanguage } from '../api/types.js'
import { UI_TEXT } from '../uiText.js'
import { AuthPanel } from './AuthPanel.js'

export function AuthModal({
  language,
  user,
  pending,
  error,
  onLogin,
  onRegister,
  onLogout,
  onClose,
}: {
  language: SupportedLanguage
  user: PublicUser | null
  pending: boolean
  error: string | null
  onLogin: (email: string, password: string) => Promise<boolean>
  onRegister: (email: string, password: string) => Promise<boolean>
  onLogout: () => Promise<void>
  onClose: () => void
}) {
  const reduceMotion = useReducedMotion()
  const text = UI_TEXT[language]

  return (
    <motion.div
      className="samjho-modal-backdrop"
      role="presentation"
      onClick={onClose}
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="samjho-modal samjho-glass"
        role="dialog"
        aria-label={text.authHeading}
        onClick={(event) => event.stopPropagation()}
        initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduceMotion ? undefined : { opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.22 }}
      >
        <button type="button" className="samjho-modal__close" aria-label={text.closeButtonAriaLabel} onClick={onClose}>
          ×
        </button>
        <AuthPanel
          language={language}
          user={user}
          pending={pending}
          error={error}
          onLogin={onLogin}
          onRegister={onRegister}
          onLogout={onLogout}
        />
      </motion.div>
    </motion.div>
  )
}
