import type { TermCategory } from '../../shared/discoveryTypes'

export type TermPattern = { category: TermCategory; regex: RegExp }

export const phrasePatterns: TermPattern[] = [
  { category: 'terms', regex: /terms\s*(&|and)\s*conditions/i },
  { category: 'terms', regex: /terms\s+of\s+service/i },
  { category: 'terms', regex: /terms\s+of\s+use/i },
  { category: 'terms', regex: /user\s+agreement/i },
  { category: 'terms', regex: /service\s+agreement/i },
  { category: 'terms', regex: /customer\s+agreement/i },
  { category: 'terms', regex: /legal\s+terms/i },
  { category: 'terms', regex: /conditions\s+of\s+use/i },
  { category: 'terms', regex: /platform\s+rules/i },
  { category: 'privacy', regex: /privacy\s+policy/i },
  { category: 'privacy', regex: /privacy\s+notice/i },
  { category: 'privacy', regex: /data\s+policy/i },
  { category: 'privacy', regex: /cookie\s+policy/i },
  { category: 'payment', regex: /payment\s+terms/i },
  { category: 'subscription', regex: /subscription\s+terms/i },
  { category: 'consent', regex: /consent\s+notice/i },
  { category: 'agreementAction', regex: /i\s+agree/i },
  { category: 'agreementAction', regex: /i\s+accept/i },
  { category: 'agreementAction', regex: /accept\s+terms/i },
  { category: 'agreementAction', regex: /accept\s+and\s+continue/i },
  { category: 'agreementAction', regex: /by\s+continuing/i },
  { category: 'agreementAction', regex: /by\s+clicking/i },
  { category: 'agreementAction', regex: /by\s+submitting/i },
  { category: 'agreementAction', regex: /by\s+subscribing/i },
]

export const wholeWordPatterns: TermPattern[] = [
  { category: 'terms', regex: /^terms$/i },
  { category: 'terms', regex: /^conditions$/i },
  { category: 'terms', regex: /^agreement$/i },
  { category: 'consent', regex: /^consent$/i },
  { category: 'consent', regex: /^authorization$/i },
  { category: 'consent', regex: /^disclosure$/i },
]

export const urlPatterns: TermPattern[] = [
  { category: 'terms', regex: /\/(terms|terms-of-service|terms-and-conditions|tos)(\/|$|\?)/i },
  { category: 'terms', regex: /\/legal(\/|$|\?)/i },
  { category: 'terms', regex: /\/agreement(\/|$|\?)/i },
  { category: 'privacy', regex: /\/(privacy|privacy-policy)(\/|$|\?)/i },
  { category: 'privacy', regex: /\/cookies?(-policy)?(\/|$|\?)/i },
  { category: 'subscription', regex: /\/subscription-terms(\/|$|\?)/i },
  { category: 'payment', regex: /\/payment-terms(\/|$|\?)/i },
]
