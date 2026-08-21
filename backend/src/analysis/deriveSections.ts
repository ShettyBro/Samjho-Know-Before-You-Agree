import { MAX_SECTION_SUMMARY_POINTS } from './limits.js'
import type { AnalysisSection } from './types.js'

export const SECTION_CATEGORY_MAP: Record<string, string[]> = {
  obligations: ['obligations', 'authorizationConsent'],
  charges: ['fees', 'recurringCharges'],
  renewals: ['autoRenewal'],
  cancellation: ['cancellation', 'refundRestrictions'],
  dataSharing: ['dataCollection', 'dataSharing', 'thirdParties'],
  disputeResolution: ['disputeResolution'],
}

type DerivableItem = { id: string; category: string; explanation: string }

export function deriveSection<T extends DerivableItem>(items: T[], categories: string[]): AnalysisSection {
  const matched = items.filter((item) => categories.includes(item.category))
  return {
    available: matched.length > 0,
    summary: matched.map((item) => item.explanation).slice(0, MAX_SECTION_SUMMARY_POINTS),
    relatedAttentionItemIds: matched.map((item) => item.id),
  }
}

export function deriveAllSections<T extends DerivableItem>(items: T[]): {
  obligations: AnalysisSection
  charges: AnalysisSection
  renewals: AnalysisSection
  cancellation: AnalysisSection
  dataSharing: AnalysisSection
  disputeResolution: AnalysisSection
} {
  return {
    obligations: deriveSection(items, SECTION_CATEGORY_MAP.obligations),
    charges: deriveSection(items, SECTION_CATEGORY_MAP.charges),
    renewals: deriveSection(items, SECTION_CATEGORY_MAP.renewals),
    cancellation: deriveSection(items, SECTION_CATEGORY_MAP.cancellation),
    dataSharing: deriveSection(items, SECTION_CATEGORY_MAP.dataSharing),
    disputeResolution: deriveSection(items, SECTION_CATEGORY_MAP.disputeResolution),
  }
}
