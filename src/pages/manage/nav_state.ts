import { createDisclosure } from "@hope-ui/solid"
import { createSignal } from "solid-js"
import { createStorageSignal } from "@solid-primitives/storage"
import {
  DEFAULT_NAV_WIDTH,
  clampNavWidth,
  widthFromPointerX,
} from "./nav_width"

/**
 * Shared state for the manage console shell.
 *
 * Header and SideMenu are rendered by two different trees (the desktop
 * sidebar and the mobile drawer share the same nav component), so the
 * disclosure and the persisted preferences live here instead of being
 * imported from Header — that used to be a circular import.
 */

/** Mobile navigation drawer. */
export const navDrawer = createDisclosure()

/** Rail mode: icons only. Persisted so operators keep their choice. */
const [navCollapsedRaw, setNavCollapsedRaw] = createStorageSignal(
  "open-box.manage.nav-collapsed",
  "false",
)

export const navCollapsed = () => navCollapsedRaw() === "true"

export const setNavCollapsed = (collapsed: boolean) =>
  setNavCollapsedRaw(collapsed ? "true" : "false")

export const toggleNavCollapsed = () => setNavCollapsed(!navCollapsed())

/**
 * Expanded panel width, persisted per browser.
 *
 * The stored value is clamped on the way out rather than on the way in: a
 * hand-edited or stale preference must never produce an unreadable column.
 */
const [navWidthRaw, setNavWidthRaw] = createStorageSignal(
  "open-box.manage.nav-width",
  String(DEFAULT_NAV_WIDTH),
)

const storedNavWidth = () =>
  clampNavWidth(Number.parseInt(navWidthRaw() ?? String(DEFAULT_NAV_WIDTH), 10))

/**
 * Live drag preview. While a drag is in progress the shell reads this instead
 * of the persisted value, so moving the pointer does not write to storage on
 * every frame; the value is committed once, when the pointer is released.
 */
const [dragNavWidth, setDragNavWidth] = createSignal<number | null>(null)

/** Width the sidebar should occupy right now (rail mode is applied by the shell). */
export const navWidth = () => {
  const preview = dragNavWidth()
  return preview === null ? storedNavWidth() : preview
}

export const isNavDragging = () => dragNavWidth() !== null

/** Pointer moved: preview only, nothing persisted yet. */
export const previewNavWidthFromPointer = (clientX: number) => {
  const resolved = widthFromPointerX(clientX)
  if ("collapse" in resolved) {
    setNavCollapsed(true)
    setDragNavWidth(null)
    return
  }
  setDragNavWidth(resolved.width)
}

/** Drag started: the shell drops its width transition for the duration. */
export const beginNavDrag = () => setDragNavWidth(storedNavWidth())

/** Pointer released: store the width and restore the transition. */
export const commitNavDrag = () => {
  const preview = dragNavWidth()
  if (preview !== null) setNavWidthRaw(String(preview))
  setDragNavWidth(null)
}

/** Escape during a drag: forget the preview and keep the stored width. */
export const cancelNavDrag = () => setDragNavWidth(null)

export const setNavWidth = (width: number) =>
  setNavWidthRaw(String(clampNavWidth(width)))

export const resetNavWidth = () => setNavWidthRaw(String(DEFAULT_NAV_WIDTH))

/**
 * Collapsed navigation sections. A section id in this set is folded; every
 * other section stays open. Persisted for the same reason as rail mode.
 */
const [foldedRaw, setFoldedRaw] = createStorageSignal(
  "open-box.manage.nav-folded",
  "",
)

const readFolded = (): Set<string> =>
  new Set(
    (foldedRaw() ?? "")
      .split(",")
      .map((id) => id.trim())
      .filter((id) => !!id),
  )

const [folded, setFolded] = createSignal(readFolded(), { equals: false })

export const isSectionFolded = (id: string) => folded().has(id)

export const toggleSection = (id: string) => {
  const next = readFolded()
  if (next.has(id)) next.delete(id)
  else next.add(id)
  setFoldedRaw([...next].join(","))
  setFolded(next)
}

/** Opens a folded section without closing the others. */
export const openSection = (id: string) => {
  if (!folded().has(id)) return
  const next = readFolded()
  next.delete(id)
  setFoldedRaw([...next].join(","))
  setFolded(next)
}
