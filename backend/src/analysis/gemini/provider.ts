import { deriveAllSections } from '../deriveSections.js'
import { env } from '../../config/env.js'
import { CURRENT_SCHEMA_VERSION } from '../limits.js'
import type { AgreementAnalysisProvider } from '../provider.js'
import type { AnalysisRequest } from '../types.js'
import { splitForProcessing } from './chunk.js'
import { requestChunkAnalysis } from './client.js'
import { mergeChunkResults } from './mergeChunks.js'
import type { GeminiContentPayload } from './types.js'
import { filterGroundedItems } from './verifyGrounding.js'

const DISCLAIMER =
  'Samjho helps you understand agreements more easily. This is not legal advice; consult a qualified professional for legal decisions.'

export function createGeminiProvider(analyzeChunk: (chunkText: string) => Promise<GeminiContentPayload>): AgreementAnalysisProvider {
  return {
    name: 'gemini',
    async analyze(request: AnalysisRequest) {
      const { chunks, truncated } = splitForProcessing(request.normalizedText)

      const chunkResults: GeminiContentPayload[] = []
      for (const chunkText of chunks) {
        const raw = await analyzeChunk(chunkText)
        const { items, droppedCount } = filterGroundedItems(raw.attentionItems, chunkText)
        const limitations =
          droppedCount > 0
            ? [
                ...raw.limitations,
                `${droppedCount} finding(s) were removed because their source text could not be verified against the agreement.`,
              ]
            : raw.limitations
        chunkResults.push({ ...raw, attentionItems: items, limitations })
      }

      const merged = mergeChunkResults(chunkResults, truncated)
      const generatedAt = new Date().toISOString()

      const attentionItems = merged.attentionItems.map((item) => ({
        ...item,
        sourceReference: {
          ...item.sourceReference,
          sourceType: request.sourceType,
          sourceUrl: request.resolvedUrl,
        },
      }))
      const sections = deriveAllSections(attentionItems)

      return {
        agreementId: request.agreementId,
        contentHash: request.contentHash,
        analysisVersion: request.analysisVersion,
        summary: merged.summary,
        attentionItems,
        obligations: sections.obligations,
        charges: sections.charges,
        renewals: sections.renewals,
        cancellation: sections.cancellation,
        dataSharing: sections.dataSharing,
        disputeResolution: sections.disputeResolution,
        limitations: merged.limitations,
        disclaimer: DISCLAIMER,
        generatedAt,
        providerMetadata: {
          provider: 'gemini',
          model: env.gemini.model,
          generatedAt,
          inputHash: request.contentHash,
          schemaVersion: CURRENT_SCHEMA_VERSION,
        },
      }
    },
  }
}

export const geminiProvider = createGeminiProvider(requestChunkAnalysis)
