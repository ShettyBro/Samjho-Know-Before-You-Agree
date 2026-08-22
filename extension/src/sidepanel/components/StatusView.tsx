import React, { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { SupportedLanguage } from '../../shared/analysisRequestTypes'
import { reconnectContentScript } from '../state/reconnect'
import type { PanelState } from '../state/types'
import { UI_TEXT, type UiText } from '../uiText'
import { LoadingIndicator } from './LoadingIndicator'

function messageFor(state: PanelState, text: UiText): { heading: string; body: string; showLoading: boolean } {
  switch (state.kind) {
    case 'IDLE':
    case 'DETECTING':
      return { heading: text.statusDetectingHeading, body: text.statusDetectingBody, showLoading: true }
    case 'PREPARING':
      return { heading: text.statusPreparingHeading, body: text.statusPreparingBody, showLoading: true }
    case 'PREFETCHING':
      return { heading: text.statusPrefetchingHeading, body: text.statusPrefetchingBody, showLoading: true }
    case 'NO_AGREEMENT':
      return { heading: text.statusNoAgreementHeading, body: text.statusNoAgreementBody, showLoading: false }
    case 'UNSUPPORTED':
      return { heading: text.statusUnsupportedHeading, body: text.statusUnsupportedBody, showLoading: false }
    default:
      return { heading: '', body: '', showLoading: false }
  }
}

export function StatusView({ state, onRetry, language }: { state: PanelState; onRetry: () => void; language: SupportedLanguage }) {
  const reduceMotion = useReducedMotion()
  const text = UI_TEXT[language]

  if (state.kind === 'ERROR') {
    return <ErrorView message={state.message} onRetry={onRetry} text={text} />
  }

  const { heading, body, showLoading } = messageFor(state, text)

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={state.kind}
        className="samjho-status"
        role="status"
        aria-live="polite"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={reduceMotion ? undefined : { opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {showLoading ? <LoadingIndicator /> : null}
        <h2 className="samjho-status__heading">{heading}</h2>
        <p className="samjho-status__body">{body}</p>
        {state.kind === 'UNSUPPORTED' ? <ReconnectAction text={text} /> : null}
      </motion.div>
    </AnimatePresence>
  )
}

function ReconnectAction({ text }: { text: UiText }) {
  const [pending, setPending] = useState(false)
  const [failed, setFailed] = useState(false)

  async function handleClick(): Promise<void> {
    setPending(true)
    setFailed(false)
    const succeeded = await reconnectContentScript()
    setPending(false)
    if (!succeeded) setFailed(true)
  }

  return (
    <div>
      <button type="button" className="samjho-button" onClick={() => void handleClick()} disabled={pending}>
        {text.reconnectButton}
      </button>
      {failed ? (
        <p className="samjho-status__body" role="alert">
          {text.reconnectFailed}
        </p>
      ) : null}
    </div>
  )
}

function ErrorView({ message, onRetry, text }: { message: string; onRetry: () => void; text: UiText }) {
  return (
    <div className="samjho-status samjho-status--error" role="alert">
      <h2 className="samjho-status__heading">{text.statusErrorHeading}</h2>
      <p className="samjho-status__body">{message}</p>
      <button type="button" className="samjho-button samjho-button--primary" onClick={onRetry}>
        {text.retryButton}
      </button>
    </div>
  )
}
