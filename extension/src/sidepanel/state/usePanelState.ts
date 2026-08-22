import { useEffect, useMemo, useReducer, useRef } from 'react'
import { sendRequest } from '../../shared/rpc'
import { buildAnalysisRequestPayload, type SupportedLanguage } from '../../shared/analysisRequestTypes'
import type { AnalysisResultPayload } from '../../shared/analysisResultTypes'
import { findPairByAgreementId, pairExtractionsWithIdentities, pickCurrentAgreement, type PairedCandidate } from './pairCandidates'
import { panelReducer } from './reducer'
import { resultCacheKey, type AgreementContext, type PanelState } from './types'

type CacheEntry = { result: AnalysisResultPayload; agreementText: string }

const DETECTION_TIMEOUT_MS = 4000
const ACTIVE_POLL_INTERVAL_MS = 700
const SETTLED_POLL_INTERVAL_MS = 2000
const ANALYZE_TIMEOUT_MS = 90000
const GENERIC_FAILURE_MESSAGE = "We couldn't analyze this agreement right now."

const INITIAL_STATE: PanelState = { kind: 'IDLE' }

export function usePanelState(language: SupportedLanguage, onLanguageRequested?: (language: SupportedLanguage) => void) {
  const [state, dispatch] = useReducer(panelReducer, INITIAL_STATE)
  const activeTabIdRef = useRef<number | undefined>(undefined)
  const pairedRef = useRef<PairedCandidate[]>([])
  const detectionStartedAtRef = useRef<number>(Date.now())
  const resultCacheRef = useRef<Map<string, CacheEntry>>(new Map())
  const onLanguageRequestedRef = useRef(onLanguageRequested)
  onLanguageRequestedRef.current = onLanguageRequested

  useEffect(() => {
    let cancelled = false
    let pollTimer: ReturnType<typeof setTimeout> | undefined

    async function pollTabState(tabId: number): Promise<void> {
      if (cancelled || tabId !== activeTabIdRef.current) return

      const response = await sendRequest('sidepanel', { type: 'GET_TAB_STATE', tabId })
      if (cancelled || tabId !== activeTabIdRef.current) return

      let elapsed = Date.now() - detectionStartedAtRef.current

      if (response.ok && response.payload.type === 'TAB_STATE') {
        if (response.payload.requestedLanguage) {
          onLanguageRequestedRef.current?.(response.payload.requestedLanguage)
        }

        const paired = pairExtractionsWithIdentities(response.payload.extractions, response.payload.identities)
        pairedRef.current = paired

        const agreement = pickCurrentAgreement(paired)
        if (agreement) {
          const cachedEntry = resultCacheRef.current.get(resultCacheKey(agreement))
          if (cachedEntry) {
            dispatch({ type: 'CACHED_RESULT_FOUND', agreement, result: cachedEntry.result })
          } else {
            dispatch({ type: 'AGREEMENT_FOUND', agreement })
          }
          return
        }

        const supported =
          response.payload.hasContentScript ||
          response.payload.candidates.length > 0 ||
          response.payload.extractions.length > 0 ||
          response.payload.identities.length > 0

        elapsed = Date.now() - detectionStartedAtRef.current
        if (elapsed >= DETECTION_TIMEOUT_MS) {
          dispatch({ type: 'DETECTION_TIMED_OUT', hasContentScript: supported })
        }
      }

      const interval = elapsed >= DETECTION_TIMEOUT_MS ? SETTLED_POLL_INTERVAL_MS : ACTIVE_POLL_INTERVAL_MS
      pollTimer = setTimeout(() => void pollTabState(tabId), interval)
    }

    function beginTrackingTab(tabId: number): void {
      activeTabIdRef.current = tabId
      pairedRef.current = []
      detectionStartedAtRef.current = Date.now()
      dispatch({ type: 'TAB_CHANGED' })
      void pollTabState(tabId)
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id
      if (tabId !== undefined) beginTrackingTab(tabId)
    })

    function handleActivated(activeInfo: chrome.tabs.OnActivatedInfo): void {
      if (pollTimer) clearTimeout(pollTimer)
      beginTrackingTab(activeInfo.tabId)
    }

    function handleUpdated(tabId: number, changeInfo: chrome.tabs.OnUpdatedInfo): void {
      if (tabId !== activeTabIdRef.current) return
      if (changeInfo.status === 'loading') {
        if (pollTimer) clearTimeout(pollTimer)
        beginTrackingTab(tabId)
      }
    }

    chrome.tabs.onActivated.addListener(handleActivated)
    chrome.tabs.onUpdated.addListener(handleUpdated)

    return () => {
      cancelled = true
      if (pollTimer) clearTimeout(pollTimer)
      chrome.tabs.onActivated.removeListener(handleActivated)
      chrome.tabs.onUpdated.removeListener(handleUpdated)
    }
  }, [])

  const preparingKey = useMemo(() => {
    if (state.kind !== 'PREPARING') return null
    return `${state.agreement.agreementId}:${state.agreement.contentHash}:${state.agreement.analysisVersion}:${state.attempt}`
  }, [state])

  useEffect(() => {
    if (preparingKey === null || state.kind !== 'PREPARING') return

    const agreement = state.agreement
    const attempt = state.attempt
    dispatch({ type: 'ANALYSIS_STARTED', agreement, attempt })

    const pair = findPairByAgreementId(pairedRef.current, agreement.agreementId)

    if (!pair) {
      dispatch({ type: 'ANALYSIS_FAILED', agreement, attempt, message: GENERIC_FAILURE_MESSAGE })
      return
    }

    const request = buildAnalysisRequestPayload(pair.extraction, pair.identity, language)

    let cancelled = false
    sendRequest('sidepanel', { type: 'ANALYZE_REQUEST', request }, ANALYZE_TIMEOUT_MS).then((response) => {
      if (response.ok && response.payload.type === 'ANALYZE_RESULT') {
        resultCacheRef.current.set(resultCacheKey(agreement), {
          result: response.payload.result,
          agreementText: request.normalizedText,
        })
      }
      if (cancelled) return
      if (response.ok && response.payload.type === 'ANALYZE_RESULT') {
        dispatch({ type: 'ANALYSIS_SUCCEEDED', agreement, attempt, result: response.payload.result })
        return
      }
      const message = response.payload.type === 'ERROR' ? response.payload.message : GENERIC_FAILURE_MESSAGE
      dispatch({ type: 'ANALYSIS_FAILED', agreement, attempt, message })
    })

    return () => {
      cancelled = true
    }
  }, [preparingKey, language])

  function retry(): void {
    dispatch({ type: 'RETRY_REQUESTED' })
  }

  function getAgreementText(agreement: AgreementContext): string | undefined {
    return resultCacheRef.current.get(resultCacheKey(agreement))?.agreementText
  }

  return { state, retry, getAgreementText }
}
