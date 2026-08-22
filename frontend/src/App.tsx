import React, { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { AnalyzeInput } from './components/AnalyzeInput.js'
import { AskSamjhoLauncher } from './components/AskSamjhoLauncher.js'
import { Header } from './components/Header.js'
import { HistoryModal } from './components/HistoryModal.js'
import { Navbar } from './components/Navbar.js'
import { ResultView } from './components/ResultView.js'
import { StatusView } from './components/StatusView.js'
import type { SupportedLanguage } from './api/types.js'
import { useAnalysis } from './state/useAnalysis.js'
import { useAuth } from './state/useAuth.js'
import { useHistory } from './state/useHistory.js'
import { UI_TEXT } from './uiText.js'

const DEFAULT_LANGUAGE: SupportedLanguage = 'en'
const TITLE_PREVIEW_LENGTH = 80

function deriveTitle(text: string): string {
  const firstLine = text.split('\n')[0]?.trim() ?? ''
  const base = firstLine.length > 0 ? firstLine : text.trim()
  if (base.length === 0) return 'Agreement'
  return base.length > TITLE_PREVIEW_LENGTH ? `${base.slice(0, TITLE_PREVIEW_LENGTH - 3)}...` : base
}

function App() {
  const [language, setLanguage] = useState<SupportedLanguage>(DEFAULT_LANGUAGE)
  const text = UI_TEXT[language]
  const auth = useAuth()
  const history = useHistory(auth.user)
  const { state, submitText, submitPdf, reset } = useAnalysis(language, text)
  const busy = state.kind === 'UPLOADING' || state.kind === 'EXTRACTING' || state.kind === 'PREPARING' || state.kind === 'PREFETCHING'
  const [historyOpen, setHistoryOpen] = useState(false)

  async function handleSaveToggle(): Promise<void> {
    if (state.kind !== 'READY') return
    if (history.isSaved(state.result.agreementId)) {
      await history.unsave(state.result.agreementId)
      return
    }
    await history.save({
      agreementId: state.result.agreementId,
      contentHash: state.result.contentHash,
      analysisVersion: state.result.analysisVersion,
      title: deriveTitle(state.agreementText),
      result: state.result,
    })
  }

  return (
    <>
      <Navbar
        language={language}
        onLanguageChange={setLanguage}
        user={auth.user}
        authPending={auth.pending}
        authError={auth.error}
        onLogin={auth.login}
        onRegister={auth.register}
        onLogout={auth.logout}
        onOpenHistory={() => setHistoryOpen(true)}
      />

      <main className="samjho-page">
        {state.kind === 'READY' ? (
          <>
            {auth.user ? (
              <button type="button" className="samjho-button samjho-button--primary samjho-save-button" onClick={() => void handleSaveToggle()}>
                {history.isSaved(state.result.agreementId) ? text.savedIndicator : text.saveButton}
              </button>
            ) : null}
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
            <Header language={language} />
            <AnalyzeInput language={language} busy={busy} onSubmitText={(value) => void submitText(value)} onSubmitPdf={(file) => void submitPdf(file)} />
            <StatusView state={state} language={language} onRetry={reset} />
          </>
        )}
      </main>

      <AnimatePresence>
        {historyOpen ? (
          <HistoryModal
            language={language}
            historyItems={history.historyItems}
            savedItems={history.savedItems}
            openResult={history.openResult}
            onOpenHistoryItem={(agreementId) => void history.openHistoryItem(agreementId)}
            onOpenSavedItem={(agreementId) => void history.openSavedItem(agreementId)}
            onUnsave={(agreementId) => void history.unsave(agreementId)}
            onCloseResult={history.closeOpenResult}
            onClose={() => {
              history.closeOpenResult()
              setHistoryOpen(false)
            }}
          />
        ) : null}
      </AnimatePresence>
    </>
  )
}

export default App
