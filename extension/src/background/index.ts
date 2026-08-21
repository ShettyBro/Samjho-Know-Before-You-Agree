import { isSamjhoMessage } from '../shared/messages'

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error('[Samjho] failed to set panel behavior', error))

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!isSamjhoMessage(message)) return undefined

  console.log('[Samjho] background received', message)
  sendResponse({ type: 'samjho/pong' })
  return true
})
