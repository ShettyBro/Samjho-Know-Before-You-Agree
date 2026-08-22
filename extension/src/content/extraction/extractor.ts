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
import { renderSameOriginUrl } from './renderViaIframe'
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

const MEANINGFUL_EXTRACTED_TEXT_LENGTH = 200

function classifyExtractedText(text: string, truncated: boolean): { confidence: ConfidenceLevel; status: ExtractionStatus } {
  if (text.length === 0) return { confidence: 'low', status: 'FAILED' }
  if (text.length < MEANINGFUL_EXTRACTED_TEXT_LENGTH) return { confidence: 'medium', status: 'PARTIAL' }
  return { confidence: 'high', status: truncated ? 'PARTIAL' : 'READY' }
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

async function extractViaFetch(
  resolved: ResolvedLink,
): Promise<{ text: string; title: string; truncated: boolean; container?: Element } | undefined> {
  try {
    const response = await fetch(resolved.resolvedUrl!, { credentials: 'same-origin' })
    if (!response.ok) return undefined

    const html = await response.text()
    const parsed = new DOMParser().parseFromString(html, 'text/html')
    const container = parsed.querySelector('main, article, [role="main"]') ?? parsed.body
    const { text, truncated } = extractText(container)
    return { text, title: parsed.title, truncated, container }
  } catch {
    return undefined
  }
}

async function extractSameOriginDocument(live: LiveCandidate, resolved: ResolvedLink): Promise<AgreementExtractionResult> {
  const fetched = await extractViaFetch(resolved)

  if (!fetched) {
    return buildResult({
      live,
      sourceType: 'sameOriginLink',
      status: 'FAILED',
      title: live.matchedText,
      originalText: '',
      normalizedText: '',
      warnings: ['fetching the resolved URL failed or threw an error'],
      confidence: 'low',
      resolved,
    })
  }

  const fetchedClassification = classifyExtractedText(fetched.text, fetched.truncated)

  if (fetchedClassification.confidence === 'high') {
    const normalized = normalizeText(fetched.text)
    const warnings: string[] = []
    if (fetched.truncated) warnings.push('content truncated at extraction length limit')

    return buildResult({
      live,
      sourceType: 'sameOriginLink',
      status: fetchedClassification.status,
      title: fetched.title || live.matchedText,
      originalText: fetched.text,
      normalizedText: normalized,
      warnings,
      confidence: 'high',
      resolved,
      container: fetched.container,
      strategy: 'fetch:same-origin',
    })
  }

  const rendered = await renderSameOriginUrl(resolved.resolvedUrl!)
  const renderedClassification = rendered ? classifyExtractedText(rendered.text, false) : undefined

  if (rendered && renderedClassification && renderedClassification.confidence !== 'low' && rendered.text.length > fetched.text.length) {
    const warnings: string[] = []
    if (renderedClassification.confidence === 'medium') {
      warnings.push('extracted text is too short to be confidently treated as the full document')
    }

    return buildResult({
      live,
      sourceType: 'sameOriginLink',
      status: renderedClassification.status,
      title: rendered.title || live.matchedText,
      originalText: rendered.text,
      normalizedText: rendered.normalizedText,
      warnings,
      confidence: renderedClassification.confidence,
      resolved,
      strategy: 'render:same-origin-iframe',
    })
  }

  const warnings: string[] = []
  if (fetched.truncated) warnings.push('content truncated at extraction length limit')
  if (fetched.text.length === 0) warnings.push('no extractable text found at resolved URL')
  else if (fetchedClassification.confidence === 'medium') {
    warnings.push('extracted text is too short to be confidently treated as the full document')
  }
  if (rendered) warnings.push('attempted rendering the page in a hidden frame, but it did not yield more content')

  return buildResult({
    live,
    sourceType: 'sameOriginLink',
    status: fetchedClassification.status,
    title: fetched.title || live.matchedText,
    originalText: fetched.text,
    normalizedText: normalizeText(fetched.text),
    warnings,
    confidence: fetchedClassification.confidence,
    resolved,
    container: fetched.container,
    strategy: 'fetch:same-origin',
  })
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

  if (resolved.isSameOrigin) {
    return extractSameOriginDocument(live, resolved)
  }

  if (resolved.opensNewTab) {
    return buildResult({
      live,
      sourceType: 'newTabLink',
      status: 'UNRESOLVED',
      title: live.matchedText,
      originalText: '',
      normalizedText: '',
      warnings: ['target document opens in a new tab on a different origin and was not fetched from this document context'],
      confidence: 'medium',
      resolved,
    })
  }

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

function extractSamePage(live: LiveCandidate): AgreementExtractionResult {
  const containerMatch = locateContainer(live.element)

  if (!containerMatch) {
    const fallback = nearestFallbackContainer(live.element)
    const { text, truncated } = extractText(fallback)
    const normalized = normalizeText(text)
    const { confidence, status } = classifyExtractedText(text, truncated)
    const warnings = ['no semantic container found; used the nearest ancestor with substantial text']
    if (truncated) warnings.push('content truncated at extraction length limit')
    if (confidence === 'medium') warnings.push('extracted text is too short to be confidently treated as the full document')

    return buildResult({
      live,
      sourceType: 'samePage',
      status,
      title: live.matchedText,
      originalText: text,
      normalizedText: normalized,
      warnings,
      confidence,
      container: fallback,
      strategy: 'fallback:nearest-substantial-ancestor',
    })
  }

  const sourceType = classifyContainerSourceType(containerMatch)
  const { text, truncated } = extractText(containerMatch.element)
  const normalized = normalizeText(text)
  const { confidence, status } = classifyExtractedText(text, truncated)
  const warnings: string[] = []
  if (truncated) warnings.push('content truncated at extraction length limit')
  if (text.length === 0) warnings.push('container had no extractable text')
  else if (confidence === 'medium') warnings.push('extracted text is too short to be confidently treated as the full document')

  return buildResult({
    live,
    sourceType,
    status,
    title: live.matchedText,
    originalText: text,
    normalizedText: normalized,
    warnings,
    confidence,
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
