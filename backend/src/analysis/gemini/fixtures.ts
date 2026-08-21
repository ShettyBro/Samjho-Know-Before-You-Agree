import type { GeminiContentPayload } from './types.js'

export const MINIMAL_VALID_RESPONSE: GeminiContentPayload = {
  summary: ['Minimal valid summary point.'],
  attentionItems: [],
  limitations: [],
}

export const FULL_VALID_RESPONSE: GeminiContentPayload = {
  summary: ['This agreement includes several notable clauses.', 'Review the renewal and data sharing terms.'],
  attentionItems: [
    {
      id: 'renewal',
      category: 'autoRenewal',
      importance: 'high',
      confidence: 'high',
      title: 'Automatic renewal',
      explanation: 'The subscription renews automatically each month.',
      sourceText: 'Your subscription renews automatically each month.',
      sourceReference: { headingPath: ['Section 1'], containerDescriptor: 'paragraph', sourceIndex: 0 },
    },
    {
      id: 'sharing',
      category: 'dataSharing',
      importance: 'medium',
      confidence: 'medium',
      title: 'Data sharing',
      explanation: 'Data is shared with analytics partners.',
      sourceText: 'We share data with analytics partners.',
      sourceReference: { headingPath: ['Section 2'], containerDescriptor: 'paragraph', sourceIndex: 1 },
    },
    {
      id: 'cancel',
      category: 'cancellation',
      importance: 'medium',
      confidence: 'medium',
      title: 'Cancellation',
      explanation: 'You may cancel at any time.',
      sourceText: 'You may cancel at any time from account settings.',
      sourceReference: { headingPath: ['Section 3'], containerDescriptor: 'paragraph', sourceIndex: 2 },
    },
  ],
  limitations: [],
}

export const MALFORMED_RESPONSE = { unexpected: 'shape', nested: { value: 42 } }

export const MISSING_SOURCE_EVIDENCE_RESPONSE: GeminiContentPayload = {
  summary: ['A fabricated finding is present in this fixture.'],
  attentionItems: [
    {
      id: 'fabricated',
      category: 'fees',
      importance: 'high',
      confidence: 'high',
      title: 'Fabricated fee',
      explanation: 'An invented penalty not present in the source.',
      sourceText: 'This exact sentence does not appear anywhere in the source document.',
      sourceReference: { headingPath: [], containerDescriptor: 'paragraph', sourceIndex: 0 },
    },
  ],
  limitations: [],
}

export const OVERSIZED_SOURCE_TEXT = 'Clause text describing obligations. '.repeat(20000)

export const UNSUPPORTED_CATEGORY_RESPONSE: GeminiContentPayload = {
  summary: ['Contains an unsupported category value.'],
  attentionItems: [
    {
      id: 'unknownCategory',
      category: 'madeUpCategory',
      importance: 'high',
      confidence: 'high',
      title: 'Unknown clause',
      explanation: 'This clause does not map to a known category.',
      sourceText: 'Your subscription renews automatically each month.',
      sourceReference: { headingPath: [], containerDescriptor: 'paragraph', sourceIndex: 0 },
    },
  ],
  limitations: [],
}

export const MISSING_OPTIONAL_FIELDS_RESPONSE: GeminiContentPayload = {
  summary: ['Optional fields omitted where the contract allows it.'],
  attentionItems: [
    {
      id: 'plain',
      category: 'other',
      importance: 'low',
      confidence: 'low',
      title: 'General note',
      explanation: 'A general observation with no heading path or source URL.',
      sourceText: 'You may cancel at any time from account settings.',
      sourceReference: { headingPath: [], containerDescriptor: 'paragraph', sourceIndex: 0 },
    },
  ],
  limitations: [],
}
