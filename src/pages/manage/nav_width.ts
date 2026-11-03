/**
 * Geometry of the console sidebar.
 *
 * The sidebar has two modes, like the assistants an operator already uses:
 * a labelled panel that can be dragged to any comfortable width, and an icon
 * rail that keeps the current page in view. The numbers live here so the drag
 * handler, the shell and the tests cannot drift apart.
 */

/** Width of the icon rail. Not resizable — it is a rail, not a column. */
export const RAIL_WIDTH = 68

/** Width of a freshly opened panel, and what a double-click restores. */
export const DEFAULT_NAV_WIDTH = 268

/** Narrowest the panel may be dragged before the labels stop fitting. */
export const MIN_NAV_WIDTH = 216

/** Widest the panel may be dragged before it crowds the page beside it. */
export const MAX_NAV_WIDTH = 440

/** Keyboard step on the resize handle, and the larger Shift step. */
export const NAV_WIDTH_STEP = 12
export const NAV_WIDTH_LARGE_STEP = 32

/**
 * Clamps a requested width into the usable range.
 *
 * Non-finite input (a corrupt persisted value, a NaN from a pointer
 * calculation) falls back to the default instead of poisoning the layout.
 */
export const clampNavWidth = (value: number): number => {
  if (!Number.isFinite(value)) return DEFAULT_NAV_WIDTH
  return Math.min(MAX_NAV_WIDTH, Math.max(MIN_NAV_WIDTH, Math.round(value)))
}

/**
 * Resolves the width a drag should produce from a pointer position.
 *
 * The handle sits on the right edge of the panel, so the pointer's page X is
 * the panel width. Dragging well past the minimum is treated as a request to
 * fold the panel into the rail — the way the apps this console imitates behave
 * — and reports that instead of a width.
 */
export const widthFromPointerX = (
  clientX: number,
): { width: number } | { collapse: true } => {
  if (!Number.isFinite(clientX)) return { width: DEFAULT_NAV_WIDTH }
  if (clientX < MIN_NAV_WIDTH - 40) return { collapse: true }
  return { width: clampNavWidth(clientX) }
}

/** Media query used to drop the resize animation for reduced-motion users. */
export const prefersReducedMotion = (): boolean => {
  if (typeof matchMedia !== "function") return false
  return matchMedia("(prefers-reduced-motion: reduce)").matches
}
