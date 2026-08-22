export const SAMJHO_OWNED_ATTRIBUTE = 'data-samjho-owned'
export const SAMJHO_WEB_APP_META_NAME = 'samjho-web-app'

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

export function isSamjhoWebApp(doc: Document = document): boolean {
  return doc.querySelector(`meta[name="${SAMJHO_WEB_APP_META_NAME}"]`) !== null
}
