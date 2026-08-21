export type SamjhoMessage = { type: 'samjho/ping'; from: 'content' | 'sidepanel' }

export function isSamjhoMessage(value: unknown): value is SamjhoMessage {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    (value as { type: unknown }).type === 'samjho/ping'
  )
}
