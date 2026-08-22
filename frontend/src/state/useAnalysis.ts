import { useState } from 'react'
import { analyzePastedText, analyzePdf } from '../api/analyze.js'
import type { SupportedLanguage } from '../api/types.js'
import type { AnalysisState } from './analysisTypes.js'

const MAX_TEXT_LENGTH = 50000
const MAX_PDF_BYTES = 8 * 1024 * 1024

export function useAnalysis(language: SupportedLanguage, uiText: { pasteEmptyError: string; pasteTooLongError: string; pdfWrongTypeError: string; pdfTooLargeError: string }) {
  const [state, setState] = useState<AnalysisState>({ kind: 'IDLE' })

  function reset(): void {
    setState({ kind: 'IDLE' })
  }

  async function submitText(rawText: string): Promise<void> {
    const trimmed = rawText.trim()
    if (trimmed.length === 0) {
      setState({ kind: 'INPUT_ERROR', message: uiText.pasteEmptyError })
      return
    }
    if (trimmed.length > MAX_TEXT_LENGTH) {
      setState({ kind: 'INPUT_ERROR', message: uiText.pasteTooLongError })
      return
    }

    setState({ kind: 'PREPARING' })
    const outcome = await analyzePastedText(trimmed, language)
    if (!outcome.ok) {
      setState({ kind: 'ERROR', message: outcome.error.message })
      return
    }
    setState({ kind: 'READY', result: outcome.value.result, agreementText: outcome.value.agreementText })
  }

  async function submitPdf(file: File): Promise<void> {
    if (file.type !== 'application/pdf' || !file.name.toLowerCase().endsWith('.pdf')) {
      setState({ kind: 'INPUT_ERROR', message: uiText.pdfWrongTypeError })
      return
    }
    if (file.size > MAX_PDF_BYTES) {
      setState({ kind: 'INPUT_ERROR', message: uiText.pdfTooLargeError })
      return
    }

    setState({ kind: 'UPLOADING' })
    const outcome = await analyzePdf(file, language)
    if (!outcome.ok) {
      setState({ kind: 'ERROR', message: outcome.error.message })
      return
    }
    setState({ kind: 'READY', result: outcome.value.result, agreementText: outcome.value.agreementText })
  }

  return { state, submitText, submitPdf, reset }
}
