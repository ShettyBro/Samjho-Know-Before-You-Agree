import { SAMJHO_OWNED_ATTRIBUTE } from '../../shared/dom'
import { POPUP_STYLES } from './styles'

export function createShadowHost(tagName: string): { host: HTMLElement; mountPoint: HTMLElement } {
  const host = document.createElement(tagName)
  host.setAttribute(SAMJHO_OWNED_ATTRIBUTE, 'true')
  const shadowRoot = host.attachShadow({ mode: 'open' })

  const style = document.createElement('style')
  style.textContent = POPUP_STYLES
  shadowRoot.appendChild(style)

  const mountPoint = document.createElement('div')
  shadowRoot.appendChild(mountPoint)

  return { host, mountPoint }
}
