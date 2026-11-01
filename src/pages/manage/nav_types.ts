import { IconTypes } from "solid-icons"
import { Component } from "solid-js"
import { BackendKind } from "~/utils/backend"

/**
 * Navigation model for the manage console.
 *
 * Kept in its own module so the sidebar, the nav data and the route table can
 * all import it without forming an import cycle.
 */
export interface SideMenuItemProps {
  /** i18n key, e.g. `manage.sidemenu.site`. */
  title: string
  to: string
  icon?: IconTypes
  children?: SideMenuItemProps[]
  /** Minimum role required to see this item. */
  role?: number
  external?: true
  /** Navigate with a full page load instead of a client-side route. */
  refresh?: true
  /** Restrict this item to specific backends (e.g. ["go"] or ["ts-worker"]). */
  backend?: BackendKind[]
  component?: Component
}

/** A labelled group of items — rendered as a collapsible sidebar section. */
export interface NavSection {
  /** Stable id used for the persisted fold state. */
  id: string
  title: string
  icon?: IconTypes
  items: SideMenuItemProps[]
  role?: number
  backend?: BackendKind[]
}

export type SideMenuItem = SideMenuItemProps
