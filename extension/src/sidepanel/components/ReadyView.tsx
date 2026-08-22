import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { SupportedLanguage } from '../../shared/analysisRequestTypes'
import type { AnalysisResultPayload } from '../../shared/analysisResultTypes'
import type { AgreementContext } from '../state/types'
import { UI_TEXT } from '../uiText'
import { AgreementContextBar } from './AgreementContextBar'
import { AskSamjhoLauncher } from './AskSamjhoLauncher'
import { AttentionItemsList } from './AttentionItemsList'
import { AudioControls } from './AudioControls'
import { DerivedSections } from './DerivedSections'
import { DisclaimerNote } from './DisclaimerNote'
import { SummarySection } from './SummarySection'

export function ReadyView({
  agreement,
  result,
  agreementText,
  language,
}: {
  agreement: AgreementContext
  result: AnalysisResultPayload
  agreementText: string
  language: SupportedLanguage
}) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className="samjho-ready"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <AgreementContextBar agreement={agreement} />
      <p className="samjho-ready__status" role="status">
        {UI_TEXT[language].analysisReadyStatus}
      </p>
      <SummarySection summary={result.summary} language={language} />
      <AttentionItemsList items={result.attentionItems} language={language} />
      <DerivedSections result={result} />
      <AudioControls language={language} />
      {result.limitations.length > 0 ? (
        <ul className="samjho-limitations">
          {result.limitations.map((limitation, index) => (
            <li key={index}>{limitation}</li>
          ))}
        </ul>
      ) : null}
      <DisclaimerNote disclaimer={result.disclaimer} />
      <AskSamjhoLauncher
        agreementId={agreement.agreementId}
        contentHash={agreement.contentHash}
        analysisVersion={agreement.analysisVersion}
        agreementText={agreementText}
        language={language}
      />
    </motion.div>
  )
}
