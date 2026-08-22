import type { AttentionCategory } from '../shared/analysisResultTypes'

export const CATEGORY_LABELS: Record<AttentionCategory, string> = {
  recurringCharges: 'Recurring charges',
  autoRenewal: 'Automatic renewal',
  fees: 'Fees',
  dataCollection: 'Data collection',
  dataSharing: 'Data sharing',
  thirdParties: 'Third parties',
  refundRestrictions: 'Refunds',
  cancellation: 'Cancellation',
  disputeResolution: 'Dispute resolution',
  accountTermination: 'Account termination',
  obligations: 'Your obligations',
  authorizationConsent: 'Authorization & consent',
  arbitration: 'Arbitration',
  liability: 'Liability',
  indemnification: 'Indemnification',
  governingLaw: 'Governing law',
  deadline: 'Deadline',
  other: 'Other',
}

export const IMPORTANCE_LABELS: Record<'high' | 'medium' | 'low', string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

export type DerivedSectionKey = 'charges' | 'renewals' | 'cancellation' | 'dataSharing' | 'disputeResolution' | 'obligations'

export const SECTION_LABELS: Record<DerivedSectionKey, string> = {
  charges: 'Recurring charges',
  renewals: 'Automatic renewal',
  cancellation: 'Cancellation',
  dataSharing: 'Data sharing',
  disputeResolution: 'Dispute resolution',
  obligations: 'Obligations',
}

export const SOURCE_TYPE_LABELS: Record<string, string> = {
  samePage: 'On this page',
  modal: 'In a dialog on this page',
  accordion: 'In an expandable section',
  sameOriginLink: 'Linked document',
  externalLink: 'Linked document',
  newTabLink: 'Linked document',
  pdf: 'PDF document',
}
