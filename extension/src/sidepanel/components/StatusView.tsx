import React from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { PanelState } from '../state/types'
import { LoadingIndicator } from './LoadingIndicator'

function messageFor(state: PanelState): { heading: string; body: string; showLoading: boolean } {
  switch (state.kind) {
    case 'IDLE':
    case 'DETECTING':
      return { heading: 'Looking at this page', body: 'Checking whether an agreement is available here.', showLoading: true }
    case 'PREPARING':
      return { heading: 'Preparing your agreement', body: 'Getting the document ready for review.', showLoading: true }
    case 'PREFETCHING':
      return { heading: 'Understanding the agreement', body: 'This usually takes a few seconds.', showLoading: true }
    case 'NO_AGREEMENT':
      return {
        heading: 'No agreement detected yet',
        body: 'Samjho hasn’t found a terms or privacy document on this page yet.',
        showLoading: false,
      }
    case 'UNSUPPORTED':
      return {
        heading: 'This page isn’t supported',
        body: 'Samjho can’t run on this type of browser page. Try a regular website instead.',
        showLoading: false,
      }
    default:
      return { heading: '', body: '', showLoading: false }
  }
}

export function StatusView({ state, onRetry }: { state: PanelState; onRetry: () => void }) {
  const reduceMotion = useReducedMotion()

  if (state.kind === 'ERROR') {
    return <ErrorView message={state.message} onRetry={onRetry} />
  }

  const { heading, body, showLoading } = messageFor(state)

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
      </motion.div>
    </AnimatePresence>
  )
}

function ErrorView({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="samjho-status samjho-status--error" role="alert">
      <h2 className="samjho-status__heading">We couldn&rsquo;t analyze this agreement</h2>
      <p className="samjho-status__body">{message}</p>
      <button type="button" className="samjho-button samjho-button--primary" onClick={onRetry}>
        Try again
      </button>
    </div>
  )
}
