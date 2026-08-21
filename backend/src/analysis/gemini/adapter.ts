import type { AttentionCategory, AttentionItem, ImportanceLevel, SourceType } from '../types.js'
import type { GeminiAttentionItemPayload } from './types.js'

export function adaptAttentionItem(
  item: GeminiAttentionItemPayload,
  id: string,
  context: { sourceType: SourceType; sourceUrl?: string },
): AttentionItem {
  const parsedIndex = Number.parseInt(item.sourceReference.sourceIndex, 10)
  const sectionTitle = item.sourceReference.sectionTitle.trim()

  return {
    id,
    category: item.category as AttentionCategory,
    importance: item.importance as ImportanceLevel,
    confidence: 'high',
    title: item.title,
    explanation: item.explanation,
    sourceText: item.sourceText,
    sourceReference: {
      headingPath: sectionTitle.length > 0 ? [sectionTitle] : [],
      containerDescriptor: sectionTitle.length > 0 ? sectionTitle : context.sourceType,
      sourceIndex: Number.isFinite(parsedIndex) && parsedIndex >= 0 ? parsedIndex : 0,
      sourceUrl: context.sourceUrl,
      sourceType: context.sourceType,
    },
  }
}
