import React from 'react'
import { useState } from 'react'
import type { SupportedLanguage } from '../shared/analysisRequestTypes'
import { DEFAULT_LANGUAGE } from '../shared/analysisRequestTypes'
import { Header } from './components/Header'
import { LanguageTabs } from './components/LanguageTabs'
import { ReadyView } from './components/ReadyView'
import { StatusView } from './components/StatusView'
import { usePanelState } from './state/usePanelState'

export function App() {
  const [language, setLanguage] = useState<SupportedLanguage>(DEFAULT_LANGUAGE)
  const { state, retry, getAgreementText } = usePanelState(language, setLanguage)

  return (
    <div className="samjho-panel">
      <Header language={language} />
      <LanguageTabs selected={language} onSelect={setLanguage} />
      <main className="samjho-main">
        {state.kind === 'READY' ? (
          <ReadyView agreement={state.agreement} result={state.result} agreementText={getAgreementText(state.agreement) ?? ''} language={language} />
        ) : (
          <StatusView state={state} onRetry={retry} language={language} />
        )}
      </main>
    </div>
  )
}
