export const MAX_CHUNK_CHARS = 12000
export const MAX_CHUNKS = 5

function splitParagraphs(text: string, maxChunkChars: number): string[] {
  const paragraphs = text.split(/\n{2,}/)
  const chunks: string[] = []
  let current = ''

  for (const paragraph of paragraphs) {
    const candidate = current.length === 0 ? paragraph : `${current}\n\n${paragraph}`
    if (candidate.length > maxChunkChars && current.length > 0) {
      chunks.push(current)
      current = paragraph
    } else {
      current = candidate
    }
    while (current.length > maxChunkChars) {
      chunks.push(current.slice(0, maxChunkChars))
      current = current.slice(maxChunkChars)
    }
  }

  if (current.length > 0) chunks.push(current)
  return chunks
}

export function splitForProcessing(text: string): { chunks: string[]; truncated: boolean } {
  const allChunks = splitParagraphs(text, MAX_CHUNK_CHARS)
  if (allChunks.length <= MAX_CHUNKS) return { chunks: allChunks, truncated: false }
  return { chunks: allChunks.slice(0, MAX_CHUNKS), truncated: true }
}
