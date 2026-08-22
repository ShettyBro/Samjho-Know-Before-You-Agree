import { clearTabState, handleIncomingMessage } from './router'

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error('[Samjho] failed to set panel behavior', error))

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  return handleIncomingMessage(message, sender, sendResponse)
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') clearTabState(tabId)
})

chrome.tabs.onRemoved.addListener((tabId) => {
  clearTabState(tabId)
})
