import React, { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { HistoryListItem, SavedListItem } from '../api/history.js'
import type { AnalysisResultPayload, SupportedLanguage } from '../api/types.js'
import { UI_TEXT } from '../uiText.js'
import { ResultView } from './ResultView.js'

export function HistoryModal({
  language,
  historyItems,
  savedItems,
  openResult,
  onOpenHistoryItem,
  onOpenSavedItem,
  onUnsave,
  onCloseResult,
  onClose,
}: {
  language: SupportedLanguage
  historyItems: HistoryListItem[]
  savedItems: SavedListItem[]
  openResult: AnalysisResultPayload | null
  onOpenHistoryItem: (agreementId: string) => void
  onOpenSavedItem: (agreementId: string) => void
  onUnsave: (agreementId: string) => void
  onCloseResult: () => void
  onClose: () => void
}) {
  const reduceMotion = useReducedMotion()
  const text = UI_TEXT[language]
  const [tab, setTab] = useState<'history' | 'saved'>('history')

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
        className="samjho-modal samjho-modal--wide samjho-glass"
        role="dialog"
        aria-label={text.historyModalHeading}
        onClick={(event) => event.stopPropagation()}
        initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduceMotion ? undefined : { opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.22 }}
      >
        <button type="button" className="samjho-modal__close" aria-label={text.closeButtonAriaLabel} onClick={onClose}>
          ×
        </button>

        {openResult ? (
          <div className="samjho-history-detail">
            <button type="button" className="samjho-button" onClick={onCloseResult}>
              {text.backButton}
            </button>
            <ResultView result={openResult} language={language} />
          </div>
        ) : (
          <>
            <h2 className="samjho-modal__heading">{text.historyModalHeading}</h2>
            <div className="samjho-auth-panel__tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'history'}
                className={tab === 'history' ? 'samjho-auth-tab samjho-auth-tab--selected' : 'samjho-auth-tab'}
                onClick={() => setTab('history')}
              >
                {text.historyTab}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'saved'}
                className={tab === 'saved' ? 'samjho-auth-tab samjho-auth-tab--selected' : 'samjho-auth-tab'}
                onClick={() => setTab('saved')}
              >
                {text.savedTab}
              </button>
            </div>

            {tab === 'history' ? (
              historyItems.length === 0 ? (
                <p className="samjho-history-empty">{text.historyEmpty}</p>
              ) : (
                <ul className="samjho-history-list">
                  {historyItems.map((item) => (
                    <li key={item.agreementId} className="samjho-history-item">
                      <div className="samjho-history-item__info">
                        <p className="samjho-history-item__title">{item.title}</p>
                        <p className="samjho-history-item__meta">
                          {text.analyzedLabel} {new Date(item.analyzedAt).toLocaleDateString()}
                        </p>
                        {item.changed ? <span className="samjho-history-item__changed">{text.changedIndicator}</span> : null}
                      </div>
                      <button type="button" className="samjho-button" onClick={() => onOpenHistoryItem(item.agreementId)}>
                        {text.openButton}
                      </button>
                    </li>
                  ))}
                </ul>
              )
            ) : savedItems.length === 0 ? (
              <p className="samjho-history-empty">{text.savedEmpty}</p>
            ) : (
              <ul className="samjho-history-list">
                {savedItems.map((item) => (
                  <li key={item.agreementId} className="samjho-history-item">
                    <div className="samjho-history-item__info">
                      <p className="samjho-history-item__title">{item.title}</p>
                      <p className="samjho-history-item__meta">
                        {text.savedAtLabel} {new Date(item.savedAt).toLocaleDateString()}
                      </p>
                      {item.changed ? <span className="samjho-history-item__changed">{text.changedIndicator}</span> : null}
                    </div>
                    <div className="samjho-history-item__actions">
                      <button type="button" className="samjho-button" onClick={() => onOpenSavedItem(item.agreementId)}>
                        {text.openButton}
                      </button>
                      <button type="button" className="samjho-button" onClick={() => onUnsave(item.agreementId)}>
                        {text.removeButton}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  )
}
