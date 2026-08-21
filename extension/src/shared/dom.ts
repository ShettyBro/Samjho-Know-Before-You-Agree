export const SAMJHO_OWNED_ATTRIBUTE = 'data-samjho-owned'

export function isSamjhoOwned(node: Node): boolean {
  let current: Node | null = node
  while (current) {
    if (current instanceof Element && current.hasAttribute(SAMJHO_OWNED_ATTRIBUTE)) {
      return true
    }
    current = current.parentNode
  }
  return false
}
