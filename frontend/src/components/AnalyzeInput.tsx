import React, { useRef, useState } from 'react'
import type { SupportedLanguage } from '../api/types.js'
import { UI_TEXT } from '../uiText.js'

export function AnalyzeInput({
  language,
  busy,
  onSubmitText,
  onSubmitPdf,
}: {
  language: SupportedLanguage
  busy: boolean
  onSubmitText: (text: string) => void
  onSubmitPdf: (file: File) => void
}) {
  const text = UI_TEXT[language]
  const [mode, setMode] = useState<'paste' | 'pdf'>('paste')
  const [draft, setDraft] = useState('')
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="samjho-analyze-input">
      <div className="samjho-analyze-input__tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'paste'}
          className={mode === 'paste' ? 'samjho-auth-tab samjho-auth-tab--selected' : 'samjho-auth-tab'}
          onClick={() => setMode('paste')}
        >
          {text.navPaste}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'pdf'}
          className={mode === 'pdf' ? 'samjho-auth-tab samjho-auth-tab--selected' : 'samjho-auth-tab'}
          onClick={() => setMode('pdf')}
        >
          {text.navPdf}
        </button>
      </div>

      {mode === 'paste' ? (
        <form
          className="samjho-paste-form"
          onSubmit={(event) => {
            event.preventDefault()
            if (!busy) onSubmitText(draft)
          }}
        >
          <label htmlFor="samjho-paste-textarea" className="samjho-field-label">
            {text.pasteLabel}
          </label>
          <textarea
            id="samjho-paste-textarea"
            className="samjho-paste-textarea"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={text.pastePlaceholder}
            rows={10}
            disabled={busy}
          />
          <div className="samjho-paste-form__footer">
            <span className="samjho-paste-form__count">
              {draft.length} {text.pasteCharacterCount}
            </span>
            <button type="submit" className="samjho-button samjho-button--primary" disabled={busy || draft.trim().length === 0}>
              {text.analyzeButton}
            </button>
          </div>
        </form>
      ) : (
        <div className="samjho-pdf-form">
          <p className="samjho-field-label">{text.pdfLabel}</p>
          <div className="samjho-pdf-form__row">
            <button
              type="button"
              className="samjho-button"
              onClick={() => fileInputRef.current?.click()}
              disabled={busy}
            >
              {text.pdfChooseButton}
            </button>
            <span className="samjho-pdf-form__filename">{selectedFileName ?? text.pdfNoFileChosen}</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="samjho-visually-hidden"
              onChange={(event) => setSelectedFileName(event.target.files?.[0]?.name ?? null)}
            />
          </div>
          <button
            type="button"
            className="samjho-button samjho-button--primary"
            disabled={busy || !fileInputRef.current?.files?.[0]}
            onClick={() => {
              const file = fileInputRef.current?.files?.[0]
              if (file) onSubmitPdf(file)
            }}
          >
            {text.analyzeButton}
          </button>
        </div>
      )}
    </div>
  )
}
