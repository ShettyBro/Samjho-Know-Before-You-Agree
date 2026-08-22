import React from 'react'
import type { SupportedLanguage } from '../../shared/analysisRequestTypes'
import { UI_TEXT } from '../uiText'

export function AudioControls({ language }: { language: SupportedLanguage }) {
  return (
    <section className="samjho-section" aria-labelledby="samjho-audio-heading">
      <h2 id="samjho-audio-heading" className="samjho-section__heading">
        {UI_TEXT[language].audioHeading}
      </h2>
      <div className="samjho-audio" role="group" aria-label="Audio playback controls">
        <button type="button" className="samjho-button" disabled aria-label="Play audio">
          Play
        </button>
        <button type="button" className="samjho-button" disabled aria-label="Pause audio">
          Pause
        </button>
        <button type="button" className="samjho-button" disabled aria-label="Replay audio">
          Replay
        </button>
        <span className="samjho-audio__status">Audio is coming soon</span>
      </div>
    </section>
  )
}
