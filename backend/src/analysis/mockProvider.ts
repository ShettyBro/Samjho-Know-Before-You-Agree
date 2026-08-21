import { CURRENT_SCHEMA_VERSION } from './limits.js'
import type { AgreementAnalysisProvider } from './provider.js'
import type { AnalysisRequest, AnalysisSection, AttentionCategory, AttentionItem, ImportanceLevel } from './types.js'

const MOCK_GENERATED_AT = '2024-01-01T00:00:00.000Z'

const CATEGORY_RULES: { keyword: string; category: AttentionCategory; importance: ImportanceLevel }[] = [
  { keyword: 'renew', category: 'autoRenewal', importance: 'high' },
  { keyword: 'cancel', category: 'cancellation', importance: 'high' },
  { keyword: 'refund', category: 'refundRestrictions', importance: 'medium' },
  { keyword: 'arbitrat', category: 'disputeResolution', importance: 'high' },
  { keyword: 'dispute', category: 'disputeResolution', importance: 'high' },
  { keyword: 'third part', category: 'thirdParties', importance: 'medium' },
  { keyword: 'privacy', category: 'dataSharing', importance: 'medium' },
  { keyword: 'personal data', category: 'dataCollection', importance: 'medium' },
  { keyword: 'terminat', category: 'accountTermination', importance: 'medium' },
  { keyword: 'fee', category: 'fees', importance: 'medium' },
  { keyword: 'charge', category: 'recurringCharges', importance: 'high' },
  { keyword: 'agree', category: 'authorizationConsent', importance: 'low' },
]

function splitLines(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}

function buildAttentionItems(request: AnalysisRequest): AttentionItem[] {
  const lines = splitLines(request.normalizedText)
  const items: AttentionItem[] = []
  const seenCategories = new Set<string>()

  lines.forEach((line, index) => {
    const lowerLine = line.toLowerCase()
    for (const rule of CATEGORY_RULES) {
      if (!lowerLine.includes(rule.keyword)) continue
      const key = `${rule.category}:${index}`
      if (seenCategories.has(key)) continue
      seenCategories.add(key)
      items.push({
        id: `mock-${index}-${rule.category}`,
        category: rule.category,
        importance: rule.importance,
        title: `${rule.category} clause detected`,
        explanation: `This section may relate to ${rule.category}. Review it carefully before agreeing.`,
        sourceReference: {
          headingPath: [],
          containerDescriptor: request.sourceType,
          sourceIndex: index,
          sourceUrl: request.resolvedUrl,
          sourceType: request.sourceType,
        },
        sourceText: line.slice(0, 300),
        confidence: 'medium',
      })
    }
  })

  return items
}

function buildSection(items: AttentionItem[], categories: AttentionCategory[]): AnalysisSection {
  const matched = items.filter((item) => categories.includes(item.category))
  return {
    available: matched.length > 0,
    summary: matched.map((item) => item.explanation),
    relatedAttentionItemIds: matched.map((item) => item.id),
  }
}

export const mockProvider: AgreementAnalysisProvider = {
  name: 'mock',
  async analyze(request: AnalysisRequest) {
    const attentionItems = buildAttentionItems(request)

    return {
      agreementId: request.agreementId,
      contentHash: request.contentHash,
      analysisVersion: request.analysisVersion,
      summary: [
        `This appears to be a ${request.sourceType} agreement.`,
        `${attentionItems.length} attention item(s) were identified for review.`,
      ],
      attentionItems,
      obligations: buildSection(attentionItems, ['obligations', 'authorizationConsent']),
      charges: buildSection(attentionItems, ['fees', 'recurringCharges']),
      renewals: buildSection(attentionItems, ['autoRenewal']),
      cancellation: buildSection(attentionItems, ['cancellation', 'refundRestrictions']),
      dataSharing: buildSection(attentionItems, ['dataCollection', 'dataSharing', 'thirdParties']),
      disputeResolution: buildSection(attentionItems, ['disputeResolution']),
      limitations: ['This is a deterministic mock analysis produced for contract testing, not a real legal analysis.'],
      disclaimer:
        'Samjho helps you understand agreements more easily. This is not legal advice; consult a qualified professional for legal decisions.',
      generatedAt: MOCK_GENERATED_AT,
      providerMetadata: {
        provider: 'mock',
        model: 'samjho-mock-v1',
        generatedAt: MOCK_GENERATED_AT,
        inputHash: request.contentHash,
        schemaVersion: CURRENT_SCHEMA_VERSION,
      },
    }
  },
}
