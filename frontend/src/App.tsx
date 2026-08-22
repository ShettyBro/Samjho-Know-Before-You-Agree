import React, { useState } from 'react'
import { AnalyzeInput } from './components/AnalyzeInput.js'
import { AskSamjhoLauncher } from './components/AskSamjhoLauncher.js'
import { AuthPanel } from './components/AuthPanel.js'
import { Header } from './components/Header.js'
import { LanguageTabs } from './components/LanguageTabs.js'
import { ResultView } from './components/ResultView.js'
import { StatusView } from './components/StatusView.js'
import type { SupportedLanguage } from './api/types.js'
import { useAnalysis } from './state/useAnalysis.js'
import { useAuth } from './state/useAuth.js'
import { UI_TEXT } from './uiText.js'

const DEFAULT_LANGUAGE: SupportedLanguage = 'en'

function App() {
  const [language, setLanguage] = useState<SupportedLanguage>(DEFAULT_LANGUAGE)
  const text = UI_TEXT[language]
  const auth = useAuth()
  const { state, submitText, submitPdf, reset } = useAnalysis(language, text)
  const busy = state.kind === 'UPLOADING' || state.kind === 'EXTRACTING' || state.kind === 'PREPARING' || state.kind === 'PREFETCHING'

  return (
    <main className="samjho-page">
      <Header language={language} />
      <LanguageTabs selected={language} onSelect={setLanguage} />

      <AuthPanel
        language={language}
        user={auth.user}
        pending={auth.pending}
        error={auth.error}
        onLogin={auth.login}
        onRegister={auth.register}
        onLogout={auth.logout}
      />

      {state.kind === 'READY' ? (
        <>
          <ResultView result={state.result} language={language} />
          <AskSamjhoLauncher
            agreementId={state.result.agreementId}
            contentHash={state.result.contentHash}
            analysisVersion={state.result.analysisVersion}
            agreementText={state.agreementText}
            language={language}
          />
        </>
      ) : (
        <>
          <AnalyzeInput language={language} busy={busy} onSubmitText={(value) => void submitText(value)} onSubmitPdf={(file) => void submitPdf(file)} />
          <StatusView state={state} language={language} onRetry={reset} />
        </>
      )}
    </main>
  )
}

export default App
