import { sendRequest } from '../../shared/rpc'

export async function reconnectContentScript(): Promise<boolean> {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
  const tabId = tabs[0]?.id
  if (tabId === undefined) return false

  const response = await sendRequest('sidepanel', { type: 'REINJECT_CONTENT_SCRIPT', tabId })
  return response.ok && response.payload.type === 'REINJECT_CONTENT_SCRIPT_ACK' && response.payload.injected
}
