import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { DEFAULT_LANGUAGE, type SupportedLanguage } from '../../shared/analysisRequestTypes'
import { createShadowHost } from './mount'
import { requestOpenSidePanel } from './openSidePanel'
import { Popup } from './Popup'

type ShowFn = (language: SupportedLanguage) => void

let showBridge: ShowFn | null = null
let pendingShowLanguage: SupportedLanguage | null = null
let hostElement: HTMLElement | null = null

function OverlayRoot() {
  const [visible, setVisible] = useState(false)
  const [language, setLanguage] = useState<SupportedLanguage>(DEFAULT_LANGUAGE)

  useEffect(() => {
    showBridge = (nextLanguage) => {
      setLanguage(nextLanguage)
      setVisible(true)
    }
    if (pendingShowLanguage) {
      showBridge(pendingShowLanguage)
      pendingShowLanguage = null
    }
    return () => {
      showBridge = null
    }
  }, [])

  useEffect(() => {
    if (!visible) return undefined

    function handleOutsideClick(event: MouseEvent): void {
      if (!isEventInsidePopup(event)) setVisible(false)
    }

    document.addEventListener('click', handleOutsideClick, true)
    return () => document.removeEventListener('click', handleOutsideClick, true)
  }, [visible])

  if (!visible) return null

  return (
    <div className="samjho-popup-overlay">
      <Popup
        language={language}
        onSelectLanguage={setLanguage}
        onUnderstandMore={() => {
          requestOpenSidePanel(language)
          setVisible(false)
        }}
        onClose={() => setVisible(false)}
      />
    </div>
  )
}

export function ensurePopupMounted(): HTMLElement {
  if (hostElement?.isConnected) return hostElement
  const { host, mountPoint } = createShadowHost('samjho-popup-host')
  document.documentElement.appendChild(host)
  createRoot(mountPoint).render(<OverlayRoot />)
  hostElement = host
  return host
}

export function showPopup(language: SupportedLanguage): void {
  ensurePopupMounted()
  if (showBridge) {
    showBridge(language)
  } else {
    pendingShowLanguage = language
  }
}

export function isEventInsidePopup(event: Event): boolean {
  return hostElement !== null && event.composedPath().includes(hostElement)
}
