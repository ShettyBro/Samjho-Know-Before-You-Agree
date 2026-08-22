import React from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { Affordance } from './Affordance'
import { createShadowHost } from './mount'
import { computeAffordancePosition, findVisibleRect } from './position'

let currentTarget: Element | null = null
let currentHost: HTMLElement | null = null
let currentRoot: Root | null = null
let repositionListenersAttached = false

const MAX_MEASURE_RETRIES = 10

function reposition(retriesLeft: number = 0): void {
  if (!currentTarget || !currentHost || !currentTarget.isConnected) return
  const targetRect = findVisibleRect(currentTarget)
  if (!targetRect) {
    if (retriesLeft > 0) {
      requestAnimationFrame(() => reposition(retriesLeft - 1))
      return
    }
    currentHost.style.visibility = 'hidden'
    return
  }
  currentHost.style.visibility = 'visible'
  const hostRect = currentHost.getBoundingClientRect()
  const position = computeAffordancePosition(
    targetRect,
    { width: hostRect.width || 220, height: hostRect.height || 32 },
    { width: window.innerWidth, height: window.innerHeight },
  )
  currentHost.style.top = `${position.top}px`
  currentHost.style.left = `${position.left}px`
}

function handleViewportChange(): void {
  reposition()
}

function attachRepositionListeners(): void {
  if (repositionListenersAttached) return
  repositionListenersAttached = true
  window.addEventListener('scroll', handleViewportChange, true)
  window.addEventListener('resize', handleViewportChange)
}

function detachRepositionListeners(): void {
  if (!repositionListenersAttached) return
  repositionListenersAttached = false
  window.removeEventListener('scroll', handleViewportChange, true)
  window.removeEventListener('resize', handleViewportChange)
}

export function syncAffordance(target: Element | null, label: string, onClick: () => void): void {
  if (target === currentTarget && currentHost?.isConnected) {
    currentRoot?.render(React.createElement(Affordance, { label, onClick }))
    reposition()
    return
  }

  teardownAffordance()
  if (!target) return

  const { host, mountPoint } = createShadowHost('samjho-affordance-host')
  host.style.position = 'fixed'
  host.style.margin = '0'
  host.style.zIndex = '2147483647'
  host.style.visibility = 'hidden'
  document.documentElement.appendChild(host)

  currentTarget = target
  currentHost = host
  currentRoot = createRoot(mountPoint)
  currentRoot.render(React.createElement(Affordance, { label, onClick }))
  attachRepositionListeners()
  requestAnimationFrame(() => reposition(MAX_MEASURE_RETRIES))
}

export function teardownAffordance(): void {
  currentRoot?.unmount()
  currentHost?.remove()
  currentTarget = null
  currentHost = null
  currentRoot = null
  detachRepositionListeners()
}
