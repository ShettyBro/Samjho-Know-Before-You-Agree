import { Type } from '@google/genai'
import { ALLOWED_CATEGORIES, ALLOWED_IMPORTANCE_LEVELS } from '../limits.js'

const sourceReferenceSchema = {
  type: Type.OBJECT,
  properties: {
    sectionTitle: { type: Type.STRING },
    sourceIndex: { type: Type.STRING },
  },
  required: ['sectionTitle', 'sourceIndex'],
}

const attentionItemSchema = {
  type: Type.OBJECT,
  properties: {
    category: { type: Type.STRING, enum: [...ALLOWED_CATEGORIES] },
    importance: { type: Type.STRING, enum: [...ALLOWED_IMPORTANCE_LEVELS] },
    title: { type: Type.STRING },
    explanation: { type: Type.STRING },
    sourceText: { type: Type.STRING },
    sourceReference: sourceReferenceSchema,
  },
  required: ['category', 'importance', 'title', 'explanation', 'sourceText', 'sourceReference'],
}

export const GEMINI_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.ARRAY, items: { type: Type.STRING } },
    attentionItems: { type: Type.ARRAY, items: attentionItemSchema },
  },
  required: ['summary', 'attentionItems'],
}
