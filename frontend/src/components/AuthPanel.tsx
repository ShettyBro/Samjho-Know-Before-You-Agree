import React, { useState } from 'react'
import type { PublicUser, SupportedLanguage } from '../api/types.js'
import { UI_TEXT } from '../uiText.js'

export function AuthPanel({
  language,
  user,
  pending,
  error,
  onLogin,
  onRegister,
  onLogout,
}: {
  language: SupportedLanguage
  user: PublicUser | null
  pending: boolean
  error: string | null
  onLogin: (email: string, password: string) => Promise<boolean>
  onRegister: (email: string, password: string) => Promise<boolean>
  onLogout: () => Promise<void>
}) {
  const text = UI_TEXT[language]
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (user) {
    return (
      <div className="samjho-auth-panel samjho-auth-panel--signed-in">
        <span className="samjho-auth-panel__status">
          {text.loggedInAs} {user.email}
        </span>
        <button type="button" className="samjho-button" onClick={() => void onLogout()}>
          {text.logoutButton}
        </button>
      </div>
    )
  }

  return (
    <div className="samjho-auth-panel">
      <div className="samjho-auth-panel__tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'login'}
          className={mode === 'login' ? 'samjho-auth-tab samjho-auth-tab--selected' : 'samjho-auth-tab'}
          onClick={() => setMode('login')}
        >
          {text.loginTab}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'register'}
          className={mode === 'register' ? 'samjho-auth-tab samjho-auth-tab--selected' : 'samjho-auth-tab'}
          onClick={() => setMode('register')}
        >
          {text.registerTab}
        </button>
      </div>

      <form
        className="samjho-auth-form"
        onSubmit={(event) => {
          event.preventDefault()
          if (pending) return
          void (mode === 'login' ? onLogin(email, password) : onRegister(email, password))
        }}
      >
        <label className="samjho-auth-form__field">
          {text.emailLabel}
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
          />
        </label>
        <label className="samjho-auth-form__field">
          {text.passwordLabel}
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
        </label>

        {error ? (
          <p className="samjho-auth-form__error" role="alert">
            {error}
          </p>
        ) : null}

        <button type="submit" className="samjho-button samjho-button--primary" disabled={pending}>
          {pending ? text.authLoading : mode === 'login' ? text.loginButton : text.registerButton}
        </button>
      </form>

      <p className="samjho-auth-panel__guest-notice">{text.guestNotice}</p>
    </div>
  )
}
