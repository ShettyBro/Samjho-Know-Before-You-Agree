import { MAX_ATTENTION_ITEMS, MAX_LIMITATIONS, MAX_SUMMARY_POINTS } from '../limits.js'
import type { GeminiContentPayload } from './types.js'

const IMPORTANCE_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 }

export function mergeChunkResults(chunkResults: GeminiContentPayload[], truncated: boolean): GeminiContentPayload {
  const attentionItems: GeminiContentPayload['attentionItems'] = []
  let idCounter = 0

  chunkResults.forEach((chunk, chunkIndex) => {
    for (const item of chunk.attentionItems) {
      const newId = `gemini-${idCounter}`
      idCounter += 1
      attentionItems.push({
        ...item,
        id: newId,
        sourceReference: {
          ...item.sourceReference,
          containerDescriptor:
            chunkResults.length > 1
              ? `chunk ${chunkIndex + 1} of ${chunkResults.length}: ${item.sourceReference.containerDescriptor}`
              : item.sourceReference.containerDescriptor,
        },
      })
    }
  })

  attentionItems.sort((a, b) => (IMPORTANCE_RANK[a.importance] ?? 3) - (IMPORTANCE_RANK[b.importance] ?? 3))
  const cappedItems = attentionItems.slice(0, MAX_ATTENTION_ITEMS)

  const summary = Array.from(new Set(chunkResults.flatMap((chunk) => chunk.summary))).slice(0, MAX_SUMMARY_POINTS)
  const limitations = Array.from(new Set(chunkResults.flatMap((chunk) => chunk.limitations)))
  if (truncated) {
    limitations.push(
      'This agreement was too long to analyze in full; analysis covers only the earliest sections within safe processing limits.',
    )
  }

  return {
    summary,
    attentionItems: cappedItems,
    limitations: limitations.slice(0, MAX_LIMITATIONS),
  }
}
