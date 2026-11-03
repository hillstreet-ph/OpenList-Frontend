import {
  Avatar,
  Box,
  Divider,
  Heading,
  Icon,
  IconButton,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
  Tooltip,
  useColorModeValue,
} from "@hope-ui/solid"
import { JSX, Show, onCleanup } from "solid-js"
import {
  BsBraces,
  BsLayoutSidebar,
  BsLayoutSidebarReverse,
} from "solid-icons/bs"
import { FiLogOut, FiSettings, FiUser } from "solid-icons/fi"
import { useRouter, useFetch, useT } from "~/hooks"
import { changeToken, handleResp, notify, r, tokenVar } from "~/utils"
import { PResp } from "~/types"
import { me } from "~/store"
import {
  beginNavDrag,
  cancelNavDrag,
  commitNavDrag,
  isNavDragging,
  navCollapsed,
  previewNavWidthFromPointer,
  resetNavWidth,
  setNavWidth,
  toggleNavCollapsed,
  navWidth,
} from "./nav_state"
import {
  MAX_NAV_WIDTH,
  MIN_NAV_WIDTH,
  NAV_WIDTH_LARGE_STEP,
  NAV_WIDTH_STEP,
  clampNavWidth,
  prefersReducedMotion,
} from "./nav_width"

const [, logOutReq] = useFetch((): PResp<any> => r.get("/auth/logout"))

const focusRing = `0 0 0 2px ${tokenVar("$info8")}`

/**
 * Top row of the sidebar: the panel's own title and its collapse control.
 *
 * ChatGPT puts the toggle on the panel rather than in the global header, so
 * the affordance is always next to the thing it changes. In rail mode only the
 * icon remains, centred, with its label moved into a tooltip.
 */
const NavTopRow = () => {
  const t = useT()
  const label = () =>
    navCollapsed() ? t("manage.nav_expand") : t("manage.nav_collapse")
  const ToggleIcon = () =>
    navCollapsed() ? <BsLayoutSidebarReverse /> : <BsLayoutSidebar />
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent={navCollapsed() ? "center" : "space-between"}
      flexShrink={0}
      h="$12"
      px={navCollapsed() ? "$0" : "$2_5"}
    >
      <Show when={!navCollapsed()}>
        <Heading
          as="span"
          fontSize="$sm"
          fontWeight="600"
          color="$neutral11"
          letterSpacing=".01em"
        >
          {t("manage.nav_title")}
        </Heading>
      </Show>
      <Tooltip label={label()} placement="right">
        <IconButton
          aria-label={label()}
          title={`${label()} (${t("manage.nav_toggle_shortcut")})`}
          icon={<ToggleIcon />}
          size="xs"
          variant="ghost"
          onClick={toggleNavCollapsed}
          css={{
            color: "$neutral11",
            _hover: { backgroundColor: "rgba(132,133,141,0.18)" },
            _focusVisible: { outline: "none", boxShadow: focusRing },
          }}
        />
      </Tooltip>
    </Box>
  )
}

/**
 * Account row pinned to the bottom of the panel.
 *
 * Same menu the header used to carry — Profile, Developer (the personal token
 * console), Settings, Log out — placed where the assistant apps put it, so the
 * operator finds it without scanning the top bar.
 */
const AccountRow = (props: { rail: boolean; onNavigate?: () => void }) => {
  const t = useT()
  const { to } = useRouter()
  const rule = useColorModeValue("$neutral3", "$neutral4")
  const logOut = async () => {
    handleResp(await logOutReq(), () => {
      changeToken()
      notify.success(t("manage.logout_success"))
      to(`/@login?redirect=${encodeURIComponent(location.pathname)}`)
    })
  }
  const Item = (item: {
    icon: JSX.Element
    label: string
    to?: string
    danger?: boolean
    onSelect?: () => void
  }) => (
    <MenuItem
      // Hope UI reports mouse and keyboard activation through `onSelect`;
      // `onClick` never fires for a menu item, so the action belongs here.
      onSelect={() => {
        props.onNavigate?.()
        if (item.onSelect) item.onSelect()
        else if (item.to) to(item.to)
      }}
      css={{
        gap: "10px",
        fontSize: "13.5px",
        fontWeight: "500",
        color: item.danger ? "$danger9" : "$neutral12",
        _hover: {
          backgroundColor: item.danger ? "$danger2" : "$neutral3",
        },
      }}
    >
      {item.icon}
      {item.label}
    </MenuItem>
  )
  return (
    <Box
      flexShrink={0}
      p="$2"
      css={{ borderTop: `1px solid ${tokenVar(rule())}` }}
    >
      <Menu placement="top-start">
        <MenuTrigger
          as={Box}
          role="button"
          aria-label={t("manage.account_menu")}
          title={t("manage.account_menu")}
          display="flex"
          alignItems="center"
          justifyContent={props.rail ? "center" : "flex-start"}
          w="$full"
          gap="10px"
          px={props.rail ? "$0" : "$2"}
          py="$1_5"
          rounded="$lg"
          cursor="pointer"
          css={{
            border: "none",
            background: "transparent",
            textAlign: props.rail ? "center" : "left",
            transition: prefersReducedMotion()
              ? "none"
              : "background-color .15s ease",
            _hover: { backgroundColor: "rgba(132,133,141,0.14)" },
            _focusVisible: { outline: "none", boxShadow: focusRing },
          }}
        >
          <Avatar
            size="xs"
            bg="$info9"
            name={me().username || undefined}
            getInitials={(name) => name.slice(0, 1).toUpperCase()}
            iconLabel={t("manage.sidemenu.profile")}
            icon={() => <Icon as={FiUser} size={13} aria-hidden="true" />}
            css={{ flexShrink: "0", borderRadius: "$md" }}
          />
          <Show when={!props.rail}>
            <Box css={{ minWidth: 0, flex: "1" }}>
              <Heading
                as="span"
                fontSize="$sm"
                fontWeight="600"
                color="$neutral12"
                display="block"
                css={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {me().username || t("manage.sidemenu.profile")}
              </Heading>
              <Heading
                as="span"
                fontSize="11px"
                fontWeight="500"
                color="$neutral10"
                display="block"
              >
                {t("manage.account_menu")}
              </Heading>
            </Box>
          </Show>
        </MenuTrigger>
        <MenuContent minW="220px">
          <Item
            icon={<Icon as={FiUser} size={15} aria-hidden="true" />}
            label={t("manage.sidemenu.profile")}
            to="/@manage"
          />
          <Item
            icon={<Icon as={BsBraces} size={15} aria-hidden="true" />}
            label={t("manage.sidemenu.developer")}
            to="/@manage/developer"
          />
          <Item
            icon={<Icon as={FiSettings} size={15} aria-hidden="true" />}
            label={t("manage.sidemenu.settings")}
            to="/@manage/settings/site"
          />
          <Divider />
          <Item
            icon={<Icon as={FiLogOut} size={15} aria-hidden="true" />}
            label={t("manage.logout")}
            danger
            onSelect={logOut}
          />
        </MenuContent>
      </Menu>
    </Box>
  )
}

/**
 * Drag handle on the sidebar's right edge.
 *
 * Pointer drag resizes the panel live, double-click restores the default
 * width, and the same handle is a keyboard separator: arrows nudge, Shift
 * nudges further, Home resets and Escape abandons an in-progress drag. While
 * dragging, window listeners are used so the pointer may leave the handle
 * without the resize stopping; the shell drops its width transition for the
 * duration so the panel tracks the cursor instead of lagging behind it.
 */
const NavResizeHandle = () => {
  const t = useT()
  let element: HTMLDivElement | undefined

  const releaseBody = () => {
    document.body.style.cursor = ""
    document.body.style.userSelect = ""
  }
  const stop = () => {
    window.removeEventListener("pointermove", onMove)
    window.removeEventListener("pointerup", onUp)
    window.removeEventListener("pointercancel", onUp)
    releaseBody()
  }
  function onMove(e: PointerEvent) {
    previewNavWidthFromPointer(e.clientX)
    // Dragging far past the minimum folds the panel; stop tracking once the
    // drag state is gone so a released handle cannot keep resizing.
    if (!isNavDragging()) stop()
  }
  function onUp() {
    commitNavDrag()
    stop()
  }
  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0 || navCollapsed()) return
    e.preventDefault()
    beginNavDrag()
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
    window.addEventListener("pointercancel", onUp)
    document.body.style.cursor = "ew-resize"
    document.body.style.userSelect = "none"
  }
  const onKeyDown = (e: KeyboardEvent) => {
    if (navCollapsed()) return
    const step = e.shiftKey ? NAV_WIDTH_LARGE_STEP : NAV_WIDTH_STEP
    if (e.key === "ArrowLeft") setNavWidth(navWidth() - step)
    else if (e.key === "ArrowRight") setNavWidth(navWidth() + step)
    else if (e.key === "Home") resetNavWidth()
    else if (e.key === "Escape") cancelNavDrag()
    else return
    e.preventDefault()
  }
  onCleanup(stop)
  const activeBg = useColorModeValue("$info8", "$info9")
  return (
    <Box
      ref={element}
      as="div"
      role="separator"
      aria-orientation="vertical"
      aria-label={t("manage.nav_resize")}
      title={t("manage.nav_resize_hint")}
      tabIndex={navCollapsed() ? -1 : 0}
      aria-valuemin={MIN_NAV_WIDTH}
      aria-valuemax={MAX_NAV_WIDTH}
      aria-valuenow={clampNavWidth(navWidth())}
      position="absolute"
      top="$0"
      right="-4px"
      w="8px"
      cursor={navCollapsed() ? "default" : "ew-resize"}
      display={navCollapsed() ? "none" : "block"}
      zIndex="$sticky"
      onPointerDown={onPointerDown}
      onDblClick={() => resetNavWidth()}
      onKeyDown={onKeyDown}
      css={{
        // `bottom` is not one of Hope UI's positional props, so the stretch is
        // declared here; without it the empty handle collapses to 0px tall and
        // there is nothing to grab.
        bottom: "0",
        height: "100%",
        border: "none",
        background: "transparent",
        padding: "0",
        transition: prefersReducedMotion()
          ? "none"
          : "background-color .15s ease",
        "&::after": {
          content: "''",
          position: "absolute",
          top: "0",
          bottom: "0",
          left: "3px",
          width: "2px",
          backgroundColor: "transparent",
          transition: "background-color .15s ease",
        },
        _hover: { "&::after": { backgroundColor: activeBg() } },
        _focusVisible: {
          outline: "none",
          boxShadow: focusRing,
          borderRadius: "$md",
        },
        "&[data-dragging=true]": {
          "&::after": { backgroundColor: activeBg() },
        },
      }}
      data-dragging={isNavDragging() ? "true" : "false"}
    />
  )
}

export { NavTopRow, AccountRow, NavResizeHandle }
