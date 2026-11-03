import { Box, Flex, useColorModeValue } from "@hope-ui/solid"
import { createEffect, createMemo, For, onCleanup, onMount } from "solid-js"
import { useT, useTitle } from "~/hooks"
import { Header } from "./Header"
import { SideMenu } from "./SideMenu"
import { AccountRow, NavResizeHandle, NavTopRow } from "./NavControls"
import {
  isNavDragging,
  navCollapsed,
  navWidth,
  toggleNavCollapsed,
} from "./nav_state"
import { RAIL_WIDTH, prefersReducedMotion } from "./nav_width"
import { Route, Routes } from "@solidjs/router"
import { routes } from "./routes"
import { tokenVar } from "~/utils"
import { getBackendKind } from "~/utils/backend"

/**
 * The mobile viewport changes when browser chrome shows or hides, so the
 * shell is sized with `dvh` where the browser understands it and falls back
 * to `vh` otherwise.
 */
const shellHeight = () => {
  if (typeof CSS !== "undefined" && CSS.supports?.("height", "100dvh")) {
    return "100dvh"
  }
  return "100vh"
}

/**
 * `[` folds or unfolds the panel, the same shortcut the assistants this
 * console is shaped like use. Typing must never trigger it, so the event is
 * ignored inside fields and when any modifier is held.
 */
const isTypingTarget = (target: EventTarget | null): boolean => {
  const el = target as HTMLElement | null
  if (!el || !el.tagName) return false
  if (["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName)) return true
  return el.isContentEditable === true
}

/**
 * Console shell: a sticky header over a two column body.
 *
 * The navigation column is persistent from the desktop breakpoint up and is
 * built from three stacked parts — its own toggle row, the scrollable page
 * list, and the account row — so the panel reads as one product surface rather
 * than a strip of links under a toolbar. It folds to an icon rail and can be
 * dragged to any width in between; both choices are remembered per browser.
 * Below the desktop breakpoint the same `<SideMenu />` is rendered inside the
 * header's drawer. Both columns own their scroll, so long tables never push
 * the header out of view.
 */
const Manage = () => {
  const t = useT()
  useTitle(() => t("manage.title"))
  const visibleRoutes = createMemo(() =>
    routes.filter((r) => !r.backend || r.backend.includes(getBackendKind())),
  )
  const rule = useColorModeValue("$neutral3", "$neutral4")
  let nav: HTMLDivElement | undefined
  // The width is written straight to the element: a drag changes it sixty
  // times a second and only this box needs to react, never the page beside it.
  createEffect(() => {
    if (!nav) return
    const width = navCollapsed() ? RAIL_WIDTH : navWidth()
    nav.style.width = `${width}px`
  })
  createEffect(() => {
    if (!nav) return
    const animate = !isNavDragging() && !prefersReducedMotion()
    nav.style.transition = animate ? "width .18s ease" : "none"
  })
  onMount(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "[" || e.metaKey || e.ctrlKey || e.altKey) return
      if (isTypingTarget(e.target)) return
      e.preventDefault()
      toggleNavCollapsed()
    }
    window.addEventListener("keydown", onKeyDown)
    onCleanup(() => window.removeEventListener("keydown", onKeyDown))
  })
  return (
    <Box
      css={{
        "--hope-colors-background": "var(--hope-colors-loContrast)",
        height: shellHeight(),
        display: "flex",
        flexDirection: "column",
      }}
      bgColor="$background"
      w="$full"
    >
      <Header />
      <Flex css={{ flex: "1", minHeight: 0 }}>
        <Box
          ref={nav}
          as="nav"
          aria-label={t("manage.title")}
          position="relative"
          flexShrink={0}
          h="$full"
          bgColor={useColorModeValue("$background", "$neutral2")()}
          display={{ "@initial": "none", "@lg": "flex" }}
          css={{
            flexDirection: "column",
            overflow: "visible",
            // Rendered so the first paint already has a column; afterwards the
            // effects above own the width.
            width: `${navCollapsed() ? RAIL_WIDTH : navWidth()}px`,
            borderRight: `1px solid ${tokenVar(rule())}`,
          }}
        >
          <NavTopRow />
          <Box
            class="manage-nav-scroll"
            css={{ flex: "1", minHeight: "0", overflowY: "auto" }}
          >
            <SideMenu rail={navCollapsed()} />
          </Box>
          <AccountRow rail={navCollapsed()} />
          <NavResizeHandle />
        </Box>
        <Box
          css={{ flex: "1", minWidth: 0, overflowY: "auto" }}
          p={{ "@initial": "$3", "@md": "$4" }}
        >
          <Box css={{ maxWidth: "1440px", margin: "0 auto", width: "100%" }}>
            <Routes>
              <For each={visibleRoutes()}>
                {(route) => {
                  return <Route path={route.to!} component={route.component} />
                }}
              </For>
            </Routes>
          </Box>
        </Box>
      </Flex>
    </Box>
  )
}

export default Manage
