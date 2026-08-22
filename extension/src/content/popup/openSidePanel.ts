import { sendRequest } from '../../shared/rpc'
import type { SupportedLanguage } from '../../shared/analysisRequestTypes'

export function requestOpenSidePanel(language: SupportedLanguage): void {
  sendRequest('content', { type: 'OPEN_SIDE_PANEL_REQUEST', language }).then((response) => {
    console.log('[Samjho] open side panel request sent', response)
  })
}
