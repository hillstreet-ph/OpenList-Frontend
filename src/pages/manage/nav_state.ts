import { createDisclosure } from "@hope-ui/solid"
import { createSignal } from "solid-js"
import { createStorageSignal } from "@solid-primitives/storage"

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
