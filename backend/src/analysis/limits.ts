export const CURRENT_ANALYSIS_VERSION = 'v1'
export const CURRENT_SCHEMA_VERSION = 'v1'

export const MAX_CONTENT_LENGTH = 50000
export const MAX_TEXT_FIELD_LENGTH = 2000
export const MAX_ATTENTION_ITEMS = 40
export const MAX_SUMMARY_POINTS = 12
export const MAX_SECTION_SUMMARY_POINTS = 10
export const MAX_LIMITATIONS = 10

export const SUPPORTED_LANGUAGES = ['en', 'kn', 'hi'] as const
export const SUPPORTED_SOURCE_TYPES = [
  'samePage',
  'modal',
  'accordion',
  'sameOriginLink',
  'externalLink',
  'newTabLink',
  'pdf',
] as const

export const ALLOWED_CATEGORIES = [
  'recurringCharges',
  'autoRenewal',
  'fees',
  'dataCollection',
  'dataSharing',
  'thirdParties',
  'refundRestrictions',
  'cancellation',
  'disputeResolution',
  'accountTermination',
  'obligations',
  'authorizationConsent',
  'arbitration',
  'liability',
  'indemnification',
  'governingLaw',
  'deadline',
  'other',
] as const

export const ALLOWED_IMPORTANCE_LEVELS = ['high', 'medium', 'low'] as const
