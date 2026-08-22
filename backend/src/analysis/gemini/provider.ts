import { deriveAllSections } from '../deriveSections.js'
import { env } from '../../config/env.js'
import { CURRENT_SCHEMA_VERSION } from '../limits.js'
import type { AgreementAnalysisProvider } from '../provider.js'
import type { AnalysisRequest, SupportedLanguage } from '../types.js'
import { adaptAttentionItem } from './adapter.js'
import { splitForProcessing } from './chunk.js'
import { requestChunkAnalysis } from './client.js'
import { mergeChunkResults } from './mergeChunks.js'
import type { GeminiContentPayload } from './types.js'
import { filterGroundedItems } from './verifyGrounding.js'

const DISCLAIMERS: Record<SupportedLanguage, string> = {
  en: 'Samjho helps you understand agreements more easily. This is not legal advice; consult a qualified professional for legal decisions.',
  kn: 'ಒಪ್ಪಂದಗಳನ್ನು ಸುಲಭವಾಗಿ ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಸಮ್ಝೊ ಸಹಾಯ ಮಾಡುತ್ತದೆ. ಇದು ಕಾನೂನು ಸಲಹೆಯಲ್ಲ; ಕಾನೂನು ನಿರ್ಧಾರಗಳಿಗಾಗಿ ಅರ್ಹ ವೃತ್ತಿಪರರನ್ನು ಸಂಪರ್ಕಿಸಿ.',
  hi: 'समझो समझौतों को अधिक आसानी से समझने में मदद करता है। यह कानूनी सलाह नहीं है; कानूनी निर्णयों के लिए किसी योग्य पेशेवर से सलाह लें।',
}

export function createGeminiProvider(
  analyzeChunk: (chunkText: string, language: SupportedLanguage) => Promise<GeminiContentPayload>,
): AgreementAnalysisProvider {
  return {
    name: 'gemini',
    async analyze(request: AnalysisRequest) {
      const { chunks, truncated } = splitForProcessing(request.normalizedText)

      const perChunkResults = await Promise.all(
        chunks.map(async (chunkText) => {
          const raw = await analyzeChunk(chunkText, request.language)
          const { items, droppedCount } = filterGroundedItems(raw.attentionItems, chunkText)
          return { summary: raw.summary, attentionItems: items, droppedCount }
        }),
      )

      let totalDropped = 0
      const chunkResults: GeminiContentPayload[] = []
      for (const result of perChunkResults) {
        totalDropped += result.droppedCount
        chunkResults.push({ summary: result.summary, attentionItems: result.attentionItems })
      }

      const merged = mergeChunkResults(chunkResults)
      const generatedAt = new Date().toISOString()

      const attentionItems = merged.attentionItems.map((item, index) =>
        adaptAttentionItem(item, `gemini-${index}`, { sourceType: request.sourceType, sourceUrl: request.resolvedUrl }),
      )
      const sections = deriveAllSections(attentionItems)

      const limitations: string[] = []
      if (totalDropped > 0) {
        limitations.push(
          `${totalDropped} finding(s) were removed because their source text could not be verified against the agreement.`,
        )
      }
      if (truncated) {
        limitations.push(
          'This agreement was too long to analyze in full; analysis covers only the earliest sections within safe processing limits.',
        )
      }

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
        limitations,
        disclaimer: DISCLAIMERS[request.language],
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
