import { Type } from '@google/genai'

const sourceReferenceSchema = {
  type: Type.OBJECT,
  properties: {
    sectionTitle: { type: Type.STRING },
    sourceIndex: { type: Type.STRING },
  },
  required: ['sectionTitle', 'sourceIndex'],
}

export const CHAT_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    answer: { type: Type.STRING },
    sourceText: { type: Type.STRING },
    sourceReference: sourceReferenceSchema,
    confidence: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
    notFound: { type: Type.BOOLEAN },
  },
  required: ['answer', 'sourceText', 'sourceReference', 'confidence', 'notFound'],
}
