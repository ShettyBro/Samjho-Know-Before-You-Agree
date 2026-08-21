import { handleIncomingMessage } from './router'

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error('[Samjho] failed to set panel behavior', error))

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  return handleIncomingMessage(message, sendResponse)
})
