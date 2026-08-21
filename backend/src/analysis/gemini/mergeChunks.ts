import { MAX_ATTENTION_ITEMS, MAX_SUMMARY_POINTS } from '../limits.js'
import type { GeminiAttentionItemPayload, GeminiContentPayload } from './types.js'

const IMPORTANCE_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 }

export type MergedGeminiContent = {
  summary: string[]
  attentionItems: GeminiAttentionItemPayload[]
}

function dedupeKey(item: GeminiAttentionItemPayload): string {
  return `${item.category}:${item.sourceText.trim().toLowerCase()}`
}

export function mergeChunkResults(chunkResults: GeminiContentPayload[]): MergedGeminiContent {
  const seen = new Set<string>()
  const attentionItems: GeminiAttentionItemPayload[] = []

  chunkResults.forEach((chunk, chunkIndex) => {
    for (const item of chunk.attentionItems) {
      const key = dedupeKey(item)
      if (seen.has(key)) continue
      seen.add(key)

      attentionItems.push({
        ...item,
        sourceReference: {
          ...item.sourceReference,
          sectionTitle:
            chunkResults.length > 1
              ? `chunk ${chunkIndex + 1} of ${chunkResults.length}: ${item.sourceReference.sectionTitle}`
              : item.sourceReference.sectionTitle,
        },
      })
    }
  })

  attentionItems.sort((a, b) => (IMPORTANCE_RANK[a.importance] ?? 3) - (IMPORTANCE_RANK[b.importance] ?? 3))
  const cappedItems = attentionItems.slice(0, MAX_ATTENTION_ITEMS)

  const summary = Array.from(new Set(chunkResults.flatMap((chunk) => chunk.summary))).slice(0, MAX_SUMMARY_POINTS)

  return { summary, attentionItems: cappedItems }
}
