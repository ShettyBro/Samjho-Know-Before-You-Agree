import type { GeminiAttentionItemPayload } from './types.js'

export function filterGroundedItems(
  items: GeminiAttentionItemPayload[],
  sourceText: string,
): { items: GeminiAttentionItemPayload[]; droppedCount: number } {
  const kept: GeminiAttentionItemPayload[] = []
  let droppedCount = 0

  for (const item of items) {
    if (typeof item.sourceText === 'string' && item.sourceText.trim().length > 0 && sourceText.includes(item.sourceText.trim())) {
      kept.push(item)
    } else {
      droppedCount++
    }
  }

  return { items: kept, droppedCount }
}
