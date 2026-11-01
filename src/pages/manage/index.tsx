import { Box, Flex, useColorModeValue } from "@hope-ui/solid"
import { useT, useTitle } from "~/hooks"
import { Header } from "./Header"
import { SideMenu } from "./SideMenu"
import { navCollapsed } from "./nav_state"
import { Route, Routes } from "@solidjs/router"
import { createMemo, For } from "solid-js"
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
 * Console shell: a sticky header over a two column body.
 *
 * The navigation column is persistent from the desktop breakpoint up and
 * switches between a labelled list and an icon rail; below that the same
 * `<SideMenu />` is rendered inside the header's drawer. Both columns own
 * their scroll so long tables never push the header out of view.
 */
const Manage = () => {
  const t = useT()
  useTitle(() => t("manage.title"))
  const visibleRoutes = createMemo(() =>
    routes.filter((r) => !r.backend || r.backend.includes(getBackendKind())),
  )
  const rule = useColorModeValue("$neutral3", "$neutral4")
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
          as="nav"
          aria-label={t("manage.title")}
          display={{ "@initial": "none", "@lg": "block" }}
          w={navCollapsed() ? "68px" : "260px"}
          flexShrink={0}
          h="$full"
          overflowX="hidden"
          overflowY="auto"
          bgColor={useColorModeValue("$background", "$neutral2")()}
          css={{
            borderRight: `1px solid ${tokenVar(rule())}`,
            transition: "width .18s ease",
          }}
        >
          <SideMenu rail={navCollapsed()} />
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
