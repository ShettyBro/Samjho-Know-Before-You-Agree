import { isSamjhoRequest } from '../shared/messages'
import { clearTabState, handleIncomingMessage } from './router'

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error('[Samjho] failed to set panel behavior', error))

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (isSamjhoRequest(message) && message.payload.type === 'OPEN_SIDE_PANEL_REQUEST' && sender.tab?.windowId !== undefined) {
    chrome.sidePanel.open({ windowId: sender.tab.windowId }).catch((error) => console.error('[Samjho] failed to open side panel', error))
  }
  return handleIncomingMessage(message, sender, sendResponse)
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') clearTabState(tabId)
})

chrome.tabs.onRemoved.addListener((tabId) => {
  clearTabState(tabId)
})
