import type { GeminiContentPayload } from './types.js'

export const MINIMAL_VALID_RESPONSE: GeminiContentPayload = {
  summary: ['Minimal valid summary point.'],
  attentionItems: [],
}

export const FULL_VALID_RESPONSE: GeminiContentPayload = {
  summary: ['This agreement includes several notable clauses.', 'Review the renewal and data sharing terms.'],
  attentionItems: [
    {
      category: 'autoRenewal',
      importance: 'high',
      title: 'Automatic renewal',
      explanation: 'The subscription renews automatically each month.',
      sourceText: 'Your subscription renews automatically each month.',
      sourceReference: { sectionTitle: 'Section 1', sourceIndex: '0' },
    },
    {
      category: 'dataSharing',
      importance: 'medium',
      title: 'Data sharing',
      explanation: 'Data is shared with analytics partners.',
      sourceText: 'We share data with analytics partners.',
      sourceReference: { sectionTitle: 'Section 2', sourceIndex: '1' },
    },
    {
      category: 'cancellation',
      importance: 'medium',
      title: 'Cancellation',
      explanation: 'You may cancel at any time.',
      sourceText: 'You may cancel at any time from account settings.',
      sourceReference: { sectionTitle: 'Section 3', sourceIndex: '2' },
    },
  ],
}

export const MALFORMED_RESPONSE = { unexpected: 'shape', nested: { value: 42 } }

export const MISSING_SOURCE_EVIDENCE_RESPONSE: GeminiContentPayload = {
  summary: ['A fabricated finding is present in this fixture.'],
  attentionItems: [
    {
      category: 'fees',
      importance: 'high',
      title: 'Fabricated fee',
      explanation: 'An invented penalty not present in the source.',
      sourceText: 'This exact sentence does not appear anywhere in the source document.',
      sourceReference: { sectionTitle: '', sourceIndex: '0' },
    },
  ],
}

export const OVERSIZED_SOURCE_TEXT = 'Clause text describing obligations. '.repeat(20000)

export const UNSUPPORTED_CATEGORY_RESPONSE: GeminiContentPayload = {
  summary: ['Contains an unsupported category value.'],
  attentionItems: [
    {
      category: 'madeUpCategory',
      importance: 'high',
      title: 'Unknown clause',
      explanation: 'This clause does not map to a known category.',
      sourceText: 'Your subscription renews automatically each month.',
      sourceReference: { sectionTitle: '', sourceIndex: '0' },
    },
  ],
}

export const UNSUPPORTED_IMPORTANCE_RESPONSE: GeminiContentPayload = {
  summary: ['Contains an unsupported importance value.'],
  attentionItems: [
    {
      category: 'cancellation',
      importance: 'urgent',
      title: 'Cancellation',
      explanation: 'You may cancel at any time.',
      sourceText: 'You may cancel at any time from account settings.',
      sourceReference: { sectionTitle: '', sourceIndex: '0' },
    },
  ],
}

export const MISSING_SOURCE_TEXT_RESPONSE: GeminiContentPayload = {
  summary: ['Missing sourceText on a finding.'],
  attentionItems: [
    {
      category: 'cancellation',
      importance: 'medium',
      title: 'Cancellation',
      explanation: 'You may cancel at any time.',
      sourceText: '',
      sourceReference: { sectionTitle: '', sourceIndex: '0' },
    },
  ],
}

export const MISSING_OPTIONAL_FIELDS_RESPONSE: GeminiContentPayload = {
  summary: ['Optional fields omitted where the contract allows it.'],
  attentionItems: [
    {
      category: 'other',
      importance: 'low',
      title: 'General note',
      explanation: 'A general observation with no section title.',
      sourceText: 'You may cancel at any time from account settings.',
      sourceReference: { sectionTitle: '', sourceIndex: '0' },
    },
  ],
}

export const MIXED_LANGUAGE_SOURCE_TEXT =
  'You agree to these terms.\nನೀವು ಈ ನಿಯಮಗಳಿಗೆ ಒಪ್ಪುತ್ತೀರಿ.\nआप इन शर्तों से सहमत हैं।'

export const MIXED_LANGUAGE_RESPONSE: GeminiContentPayload = {
  summary: ['The agreement includes English, Kannada, and Hindi text.'],
  attentionItems: [
    {
      category: 'authorizationConsent',
      importance: 'medium',
      title: 'Consent statement',
      explanation: 'The user agrees to the terms in multiple languages.',
      sourceText: 'ನೀವು ಈ ನಿಯಮಗಳಿಗೆ ಒಪ್ಪುತ್ತೀರಿ.',
      sourceReference: { sectionTitle: '', sourceIndex: '1' },
    },
  ],
}

export const MULTI_CATEGORY_SOURCE_TEXT =
  'A recurring monthly fee applies.\n\nThe subscription renews automatically unless cancelled.\n\nA one-time setup fee applies at signup.\n\nWe collect device information for service operation.\n\nData is shared with analytics partners.\n\nData may be shared with third-party advertising partners.\n\nRefunds are not provided after seven days.\n\nCancellation requires 30 days notice.\n\nDisputes are subject to binding arbitration.\n\nAny dispute shall be resolved under the laws of the state of Delaware.\n\nAccounts may be terminated for violations of these terms.\n\nYou are responsible for maintaining accurate account information.\n\nBy using the service you authorize us to process your data.\n\nOur liability is limited to the amount paid in the last 12 months.\n\nYou agree to indemnify us against third-party claims.\n\nYou must respond to a billing dispute within 14 days.'

export const MULTI_CATEGORY_RESPONSE: GeminiContentPayload = {
  summary: ['This agreement covers billing, renewal, data practices, and dispute terms.'],
  attentionItems: [
    {
      category: 'recurringCharges',
      importance: 'high',
      title: 'Recurring fee',
      explanation: 'A recurring monthly fee applies.',
      sourceText: 'A recurring monthly fee applies.',
      sourceReference: { sectionTitle: 'Billing', sourceIndex: '0' },
    },
    {
      category: 'autoRenewal',
      importance: 'high',
      title: 'Auto-renewal',
      explanation: 'The subscription renews automatically.',
      sourceText: 'The subscription renews automatically unless cancelled.',
      sourceReference: { sectionTitle: 'Billing', sourceIndex: '1' },
    },
    {
      category: 'fees',
      importance: 'medium',
      title: 'Setup fee',
      explanation: 'A one-time setup fee applies.',
      sourceText: 'A one-time setup fee applies at signup.',
      sourceReference: { sectionTitle: 'Billing', sourceIndex: '2' },
    },
    {
      category: 'dataCollection',
      importance: 'medium',
      title: 'Device data collection',
      explanation: 'Device information is collected for service operation.',
      sourceText: 'We collect device information for service operation.',
      sourceReference: { sectionTitle: 'Privacy', sourceIndex: '3' },
    },
    {
      category: 'dataSharing',
      importance: 'medium',
      title: 'Analytics sharing',
      explanation: 'Data is shared with analytics partners.',
      sourceText: 'Data is shared with analytics partners.',
      sourceReference: { sectionTitle: 'Privacy', sourceIndex: '4' },
    },
    {
      category: 'thirdParties',
      importance: 'medium',
      title: 'Advertising sharing',
      explanation: 'Data may be shared with advertising partners.',
      sourceText: 'Data may be shared with third-party advertising partners.',
      sourceReference: { sectionTitle: 'Privacy', sourceIndex: '5' },
    },
    {
      category: 'refundRestrictions',
      importance: 'medium',
      title: 'Refund window',
      explanation: 'Refunds are not provided after seven days.',
      sourceText: 'Refunds are not provided after seven days.',
      sourceReference: { sectionTitle: 'Billing', sourceIndex: '6' },
    },
    {
      category: 'cancellation',
      importance: 'medium',
      title: 'Cancellation notice',
      explanation: 'Cancellation requires 30 days notice.',
      sourceText: 'Cancellation requires 30 days notice.',
      sourceReference: { sectionTitle: 'Billing', sourceIndex: '7' },
    },
    {
      category: 'arbitration',
      importance: 'high',
      title: 'Arbitration',
      explanation: 'Disputes are subject to binding arbitration.',
      sourceText: 'Disputes are subject to binding arbitration.',
      sourceReference: { sectionTitle: 'Disputes', sourceIndex: '8' },
    },
    {
      category: 'governingLaw',
      importance: 'low',
      title: 'Governing law',
      explanation: 'Disputes are resolved under Delaware law.',
      sourceText: 'Any dispute shall be resolved under the laws of the state of Delaware.',
      sourceReference: { sectionTitle: 'Disputes', sourceIndex: '9' },
    },
    {
      category: 'accountTermination',
      importance: 'medium',
      title: 'Account termination',
      explanation: 'Accounts may be terminated for violations.',
      sourceText: 'Accounts may be terminated for violations of these terms.',
      sourceReference: { sectionTitle: 'Account', sourceIndex: '10' },
    },
    {
      category: 'obligations',
      importance: 'low',
      title: 'Account accuracy obligation',
      explanation: 'You must keep account information accurate.',
      sourceText: 'You are responsible for maintaining accurate account information.',
      sourceReference: { sectionTitle: 'Account', sourceIndex: '11' },
    },
    {
      category: 'authorizationConsent',
      importance: 'medium',
      title: 'Data processing authorization',
      explanation: 'Using the service authorizes data processing.',
      sourceText: 'By using the service you authorize us to process your data.',
      sourceReference: { sectionTitle: 'Privacy', sourceIndex: '12' },
    },
    {
      category: 'liability',
      importance: 'high',
      title: 'Liability limitation',
      explanation: 'Liability is limited to 12 months of payments.',
      sourceText: 'Our liability is limited to the amount paid in the last 12 months.',
      sourceReference: { sectionTitle: 'Legal', sourceIndex: '13' },
    },
    {
      category: 'indemnification',
      importance: 'medium',
      title: 'Indemnification',
      explanation: 'You must indemnify the provider against third-party claims.',
      sourceText: 'You agree to indemnify us against third-party claims.',
      sourceReference: { sectionTitle: 'Legal', sourceIndex: '14' },
    },
    {
      category: 'deadline',
      importance: 'medium',
      title: 'Billing dispute deadline',
      explanation: 'Billing disputes must be raised within 14 days.',
      sourceText: 'You must respond to a billing dispute within 14 days.',
      sourceReference: { sectionTitle: 'Billing', sourceIndex: '15' },
    },
  ],
}
