import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { AnalysisResultPayload } from '../../shared/analysisResultTypes'
import type { AgreementContext } from '../state/types'
import { AgreementContextBar } from './AgreementContextBar'
import { AttentionItemsList } from './AttentionItemsList'
import { AudioControls } from './AudioControls'
import { DerivedSections } from './DerivedSections'
import { DisclaimerNote } from './DisclaimerNote'
import { SummarySection } from './SummarySection'

export function ReadyView({ agreement, result }: { agreement: AgreementContext; result: AnalysisResultPayload }) {
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
        Analysis ready.
      </p>
      <SummarySection summary={result.summary} />
      <AttentionItemsList items={result.attentionItems} />
      <DerivedSections result={result} />
      <AudioControls />
      {result.limitations.length > 0 ? (
        <ul className="samjho-limitations">
          {result.limitations.map((limitation, index) => (
            <li key={index}>{limitation}</li>
          ))}
        </ul>
      ) : null}
      <DisclaimerNote disclaimer={result.disclaimer} />
    </motion.div>
  )
}
