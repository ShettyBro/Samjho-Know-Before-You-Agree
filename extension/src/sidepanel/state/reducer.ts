import { isSameAgreement, type PanelAction, type PanelState } from './types'

function agreementOf(state: PanelState) {
  if (state.kind === 'PREPARING' || state.kind === 'PREFETCHING' || state.kind === 'READY' || state.kind === 'ERROR') {
    return state.agreement
  }
  return undefined
}

export function panelReducer(state: PanelState, action: PanelAction): PanelState {
  switch (action.type) {
    case 'TAB_CHANGED':
      return { kind: 'DETECTING' }

    case 'DETECTION_TIMED_OUT': {
      if (state.kind !== 'DETECTING') return state
      return action.hasContentScript ? { kind: 'NO_AGREEMENT' } : { kind: 'UNSUPPORTED' }
    }

    case 'AGREEMENT_FOUND': {
      const current = agreementOf(state)
      if (current && isSameAgreement(current, action.agreement) && state.kind !== 'DETECTING') {
        return state
      }
      return { kind: 'PREPARING', agreement: action.agreement, attempt: 0 }
    }

    case 'CACHED_RESULT_FOUND': {
      if (state.kind === 'READY' && isSameAgreement(state.agreement, action.agreement)) return state
      return { kind: 'READY', agreement: action.agreement, result: action.result }
    }

    case 'ANALYSIS_STARTED': {
      if (state.kind !== 'PREPARING') return state
      if (!isSameAgreement(state.agreement, action.agreement) || state.attempt !== action.attempt) return state
      return { kind: 'PREFETCHING', agreement: action.agreement, attempt: action.attempt }
    }

    case 'ANALYSIS_SUCCEEDED': {
      if (state.kind !== 'PREPARING' && state.kind !== 'PREFETCHING') return state
      if (!isSameAgreement(state.agreement, action.agreement) || state.attempt !== action.attempt) return state
      return { kind: 'READY', agreement: action.agreement, result: action.result }
    }

    case 'ANALYSIS_FAILED': {
      if (state.kind !== 'PREPARING' && state.kind !== 'PREFETCHING') return state
      if (!isSameAgreement(state.agreement, action.agreement) || state.attempt !== action.attempt) return state
      return { kind: 'ERROR', agreement: action.agreement, message: action.message, attempt: action.attempt }
    }

    case 'RETRY_REQUESTED': {
      if (state.kind !== 'ERROR') return state
      return { kind: 'PREPARING', agreement: state.agreement, attempt: state.attempt + 1 }
    }

    case 'LANGUAGE_CHANGED': {
      const agreement = agreementOf(state)
      if (!agreement) return state
      const currentAttempt = state.kind === 'PREPARING' || state.kind === 'PREFETCHING' || state.kind === 'ERROR' ? state.attempt : -1
      return { kind: 'PREPARING', agreement, attempt: currentAttempt + 1 }
    }

    default:
      return state
  }
}
