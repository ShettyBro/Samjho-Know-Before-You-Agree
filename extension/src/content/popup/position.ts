export type Rect = { top: number; left: number; bottom: number; right: number }
export type Size = { width: number; height: number }
export type Viewport = { width: number; height: number }

export const AFFORDANCE_MARGIN = 6
export const MAX_VISIBLE_ANCESTOR_LEVELS = 5

function isNonZero(rect: Rect & Partial<Size>): boolean {
  const width = rect.width ?? rect.right - rect.left
  const height = rect.height ?? rect.bottom - rect.top
  return width > 0 || height > 0
}

export type RectSource = { getBoundingClientRect: () => Rect & Size; parentElement?: RectSource | null }

export function findVisibleRect(element: RectSource, maxLevels: number = MAX_VISIBLE_ANCESTOR_LEVELS): (Rect & Size) | null {
  let current: RectSource | null = element
  for (let level = 0; level <= maxLevels && current; level += 1) {
    const rect = current.getBoundingClientRect()
    if (isNonZero(rect)) return rect
    current = current.parentElement ?? null
  }
  return null
}

export function computeAffordancePosition(targetRect: Rect, hostSize: Size, viewport: Viewport): { top: number; left: number } {
  let top = targetRect.bottom + AFFORDANCE_MARGIN
  if (top + hostSize.height > viewport.height) {
    top = targetRect.top - hostSize.height - AFFORDANCE_MARGIN
  }

  const maxLeft = Math.max(viewport.width - hostSize.width - AFFORDANCE_MARGIN, AFFORDANCE_MARGIN)
  const maxTop = Math.max(viewport.height - hostSize.height - AFFORDANCE_MARGIN, AFFORDANCE_MARGIN)

  const left = Math.min(Math.max(targetRect.left, AFFORDANCE_MARGIN), maxLeft)
  const clampedTop = Math.min(Math.max(top, AFFORDANCE_MARGIN), maxTop)

  return { top: clampedTop, left }
}
