import { Type } from '@google/genai'
import { ALLOWED_CATEGORIES, ALLOWED_IMPORTANCE_LEVELS } from '../limits.js'

const stringArray = { type: Type.ARRAY, items: { type: Type.STRING } }

const sourceReferenceSchema = {
  type: Type.OBJECT,
  properties: {
    headingPath: stringArray,
    containerDescriptor: { type: Type.STRING },
    sourceIndex: { type: Type.INTEGER },
  },
  required: ['headingPath', 'containerDescriptor', 'sourceIndex'],
}

const attentionItemSchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    category: { type: Type.STRING, format: 'enum', enum: [...ALLOWED_CATEGORIES] },
    importance: { type: Type.STRING, format: 'enum', enum: [...ALLOWED_IMPORTANCE_LEVELS] },
    confidence: { type: Type.STRING, format: 'enum', enum: [...ALLOWED_IMPORTANCE_LEVELS] },
    title: { type: Type.STRING },
    explanation: { type: Type.STRING },
    sourceText: { type: Type.STRING },
    sourceReference: sourceReferenceSchema,
  },
  required: ['id', 'category', 'importance', 'confidence', 'title', 'explanation', 'sourceText', 'sourceReference'],
}

export const GEMINI_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: stringArray,
    attentionItems: { type: Type.ARRAY, items: attentionItemSchema },
    limitations: stringArray,
  },
  required: ['summary', 'attentionItems', 'limitations'],
}
