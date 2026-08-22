import type { AnalysisResultPayload } from '../api/types.js'

export type AnalysisState =
  | { kind: 'IDLE' }
  | { kind: 'INPUT_ERROR'; message: string }
  | { kind: 'UPLOADING' }
  | { kind: 'EXTRACTING' }
  | { kind: 'PREPARING' }
  | { kind: 'PREFETCHING' }
  | { kind: 'READY'; result: AnalysisResultPayload; agreementText: string }
  | { kind: 'ERROR'; message: string }
