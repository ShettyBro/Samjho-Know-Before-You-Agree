import type { AnalysisRequest } from './types.js'

export interface AgreementAnalysisProvider {
  readonly name: string
  analyze(request: AnalysisRequest): Promise<unknown>
}
