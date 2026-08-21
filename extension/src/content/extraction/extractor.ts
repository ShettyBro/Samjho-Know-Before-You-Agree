import type { LiveCandidate } from '../discovery/types'
import type { ConfidenceLevel } from '../../shared/discoveryTypes'
import type {
  AgreementExtractionResult,
  AgreementSourceType,
  ExtractionStatus,
} from '../../shared/extractionTypes'
import {
  classifyContainerSourceType,
  computeHeadingPath,
  describeContainer,
  locateContainer,
  nearestFallbackContainer,
} from './containerLocator'
import { extractText, normalizeText } from './textExtractor'
import { resolveAnchor, resolveHref, type ResolvedLink } from './urlResolution'

type BuildParams = {
  live: LiveCandidate
  sourceType: AgreementSourceType
  status: ExtractionStatus
  title: string
  originalText: string
  normalizedText: string
  warnings: string[]
  confidence: ConfidenceLevel
  resolved?: ResolvedLink
  container?: Element
  strategy?: string
}

function buildResult(params: BuildParams): AgreementExtractionResult {
  const { live, sourceType, status, title, originalText, normalizedText, warnings, confidence, resolved, container, strategy } = params
  return {
    candidateId: live.candidateId,
    sourceType,
    title,
    sourceUrl: resolved?.originalHref,
    resolvedUrl: resolved?.resolvedUrl,
    originalText,
    normalizedText,
    sourceReference: {
      strategy: strategy ?? (resolved ? 'link' : 'unresolved'),
      headingPath: container ? computeHeadingPath(container) : [],
      containerDescriptor: container ? describeContainer(container) : '',
    },
    confidence,
    extractionStatus: status,
    extractionWarnings: warnings,
    extractedAt: Date.now(),
  }
}

async function extractSameOriginDocument(live: LiveCandidate, resolved: ResolvedLink): Promise<AgreementExtractionResult> {
  try {
    const response = await fetch(resolved.resolvedUrl!, { credentials: 'same-origin' })
    if (!response.ok) {
      return buildResult({
        live,
        sourceType: 'sameOriginLink',
        status: 'FAILED',
        title: live.matchedText,
        originalText: '',
        normalizedText: '',
        warnings: [`fetch failed with status ${response.status}`],
        confidence: 'low',
        resolved,
      })
    }

    const html = await response.text()
    const parsed = new DOMParser().parseFromString(html, 'text/html')
    const container = parsed.querySelector('main, article, [role="main"]') ?? parsed.body
    const { text, truncated } = extractText(container)
    const normalized = normalizeText(text)
    const warnings: string[] = []
    if (truncated) warnings.push('content truncated at extraction length limit')
    if (text.length === 0) warnings.push('no extractable text found at resolved URL')

    return buildResult({
      live,
      sourceType: 'sameOriginLink',
      status: text.length === 0 ? 'FAILED' : warnings.length ? 'PARTIAL' : 'READY',
      title: parsed.title || live.matchedText,
      originalText: text,
      normalizedText: normalized,
      warnings,
      confidence: text.length === 0 ? 'low' : 'high',
      resolved,
      container,
      strategy: 'fetch:same-origin',
    })
  } catch (error) {
    return buildResult({
      live,
      sourceType: 'sameOriginLink',
      status: 'FAILED',
      title: live.matchedText,
      originalText: '',
      normalizedText: '',
      warnings: [`fetch threw: ${error instanceof Error ? error.message : 'unknown error'}`],
      confidence: 'low',
      resolved,
    })
  }
}

async function extractFromResolvedLink(live: LiveCandidate, resolved: ResolvedLink): Promise<AgreementExtractionResult> {
  if (resolved.rejected) {
    return buildResult({
      live,
      sourceType: 'externalLink',
      status: 'UNRESOLVED',
      title: live.matchedText,
      originalText: '',
      normalizedText: '',
      warnings: [`link rejected: ${resolved.rejectionReason}`],
      confidence: 'low',
      resolved,
    })
  }

  if (resolved.isPdf) {
    return buildResult({
      live,
      sourceType: 'pdf',
      status: 'UNRESOLVED',
      title: live.matchedText,
      originalText: '',
      normalizedText: '',
      warnings: ['PDF extraction is not performed in the extension; defer to a backend PDF extractor'],
      confidence: 'medium',
      resolved,
    })
  }

  if (resolved.opensNewTab) {
    return buildResult({
      live,
      sourceType: 'newTabLink',
      status: 'UNRESOLVED',
      title: live.matchedText,
      originalText: '',
      normalizedText: '',
      warnings: ['target document opens in a new tab and was not fetched from this document context'],
      confidence: 'medium',
      resolved,
    })
  }

  if (!resolved.isSameOrigin) {
    return buildResult({
      live,
      sourceType: 'externalLink',
      status: 'UNRESOLVED',
      title: live.matchedText,
      originalText: '',
      normalizedText: '',
      warnings: ['cross-origin document not fetched in this module'],
      confidence: 'medium',
      resolved,
    })
  }

  return extractSameOriginDocument(live, resolved)
}

function extractSamePage(live: LiveCandidate): AgreementExtractionResult {
  const containerMatch = locateContainer(live.element)

  if (!containerMatch) {
    const fallback = nearestFallbackContainer(live.element)
    const { text, truncated } = extractText(fallback)
    const normalized = normalizeText(text)
    const warnings = ['no precise container found; used nearest bounded ancestor']
    if (truncated) warnings.push('content truncated at extraction length limit')
    return buildResult({
      live,
      sourceType: 'samePage',
      status: text.length ? 'PARTIAL' : 'FAILED',
      title: live.matchedText,
      originalText: text,
      normalizedText: normalized,
      warnings,
      confidence: 'low',
      container: fallback,
      strategy: 'fallback:nearest-ancestor',
    })
  }

  const sourceType = classifyContainerSourceType(containerMatch)
  const { text, truncated } = extractText(containerMatch.element)
  const normalized = normalizeText(text)
  const warnings: string[] = []
  if (truncated) warnings.push('content truncated at extraction length limit')
  if (text.length === 0) warnings.push('container had no extractable text')

  return buildResult({
    live,
    sourceType,
    status: text.length === 0 ? 'FAILED' : warnings.length ? 'PARTIAL' : 'READY',
    title: live.matchedText,
    originalText: text,
    normalizedText: normalized,
    warnings,
    confidence: text.length === 0 ? 'low' : 'high',
    container: containerMatch.element,
    strategy: containerMatch.strategy,
  })
}

function findAssociatedAnchor(live: LiveCandidate, url: string): HTMLAnchorElement | undefined {
  const scope = live.element.closest('label, li, div, form') ?? live.element.parentElement
  const anchors = scope?.querySelectorAll('a[href]') ?? []
  for (const anchor of Array.from(anchors)) {
    if (anchor instanceof HTMLAnchorElement) {
      const resolved = resolveAnchor(anchor, window.location.href)
      if (resolved.resolvedUrl === url) return anchor
    }
  }
  return undefined
}

export async function extractCandidate(live: LiveCandidate): Promise<AgreementExtractionResult> {
  if (live.elementType === 'link' && live.element instanceof HTMLAnchorElement) {
    const resolved = resolveAnchor(live.element, window.location.href)
    return extractFromResolvedLink(live, resolved)
  }

  const associatedUrl = live.associatedLinks[0]?.url
  if (associatedUrl) {
    const anchor = findAssociatedAnchor(live, associatedUrl)
    const resolved = anchor
      ? resolveAnchor(anchor, window.location.href)
      : resolveHref(associatedUrl, window.location.href)
    return extractFromResolvedLink(live, resolved)
  }

  return extractSamePage(live)
}
