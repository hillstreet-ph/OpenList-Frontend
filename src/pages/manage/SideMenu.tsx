import {
  Box,
  Heading,
  Icon,
  Input,
  Tooltip,
  VStack,
  useColorModeValue,
} from "@hope-ui/solid"
import { createMemo, createSignal, For, JSX, Show } from "solid-js"
import { useRouter, useT } from "~/hooks"
import { FiChevronDown, FiHome, FiSearch } from "solid-icons/fi"
import { isSectionFolded, toggleSection } from "./nav_state"
import { UserMethods, UserRole } from "~/types"
import { me } from "~/store"
import { AnchorWithBase } from "~/components"
import { Link } from "@solidjs/router"
import { hoverColor, joinBase, tokenVar } from "~/utils"
import { getBackendKind } from "~/utils/backend"
import { NavSection, SideMenuItemProps } from "./nav_types"
import { nav_sections } from "./sidemenu_items"

export type { SideMenuItemProps } from "./nav_types"

const ITEM_HEIGHT = "34px"

/** Visibility rule kept from the previous menu: guests see public pages only. */
const isAllowed = (props: {
  role?: number
  backend?: SideMenuItemProps["backend"]
}) => {
  if (props.backend && !props.backend.includes(getBackendKind())) return false
  if (!UserMethods.is_admin(me())) {
    if (props.role === undefined) return false
    else if (props.role === UserRole.GENERAL && !UserMethods.is_general(me()))
      return false
  }
  return true
}

const NavRule = (props: { my?: string }) => (
  <Box
    w="$full"
    h="1px"
    my={props.my ?? "$1"}
    bgColor={useColorModeValue("$neutral3", "$neutral4")()}
  />
)

const Row = (props: {
  label: string
  rail: boolean
  children: JSX.Element
}) => {
  // In rail mode the label moves into a tooltip; otherwise it is inline.
  return (
    <Show when={props.rail} fallback={props.children}>
      <Tooltip label={props.label} placement="right" withArrow>
        {props.children}
      </Tooltip>
    </Show>
  )
}

const NavRow = (props: {
  item: SideMenuItemProps
  label: string
  rail: boolean
  onNavigate: () => void
}) => {
  const { pathname } = useRouter()
  const activeBg = useColorModeValue("$info2", "$info3")
  const activeFg = useColorModeValue("$info11", "$info10")
  const isActive = () => pathname() === props.item.to
  return (
    <Row label={props.label} rail={props.rail}>
      <AnchorWithBase
        as={Link}
        cancelBase={props.item.to.startsWith("http")}
        display="flex"
        href={props.item.to}
        external={props.item.external}
        alignItems="center"
        h={ITEM_HEIGHT}
        flexShrink={0}
        w="$full"
        px={props.rail ? "$0" : "$2_5"}
        justifyContent={props.rail ? "center" : "flex-start"}
        rounded="$lg"
        cursor="pointer"
        bgColor={isActive() ? activeBg() : "transparent"}
        color={isActive() ? activeFg() : "$neutral12"}
        css={{
          gap: "10px",
          fontSize: "13.5px",
          fontWeight: isActive() ? "600" : "500",
          lineHeight: "1",
          textDecoration: "none",
          transition: "background-color .15s ease, color .15s ease",
          "& svg": {
            fontSize: "17px",
            flexShrink: "0",
          },
          _hover: {
            backgroundColor: isActive() ? activeBg() : hoverColor(),
            textDecoration: "none",
          },
          _focusVisible: {
            outline: "none",
            boxShadow: `0 0 0 2px ${tokenVar("$info8")}`,
          },
          "& span": {
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          },
        }}
        onClick={(e: MouseEvent) => {
          props.onNavigate()
          if (props.item.refresh) {
            e.stopPropagation?.()
            e.preventDefault?.()
            let to = props.item.to
            if (!to.startsWith("http")) to = joinBase(to)
            window.open(to, "_self")
          }
        }}
      >
        <Show when={props.item.icon}>
          {<Icon as={props.item.icon} aria-hidden="true" />}
        </Show>
        <Show when={!props.rail}>
          <Box as="span">{props.label}</Box>
        </Show>
      </AnchorWithBase>
    </Row>
  )
}

/** Pinned entry: the file browser lives outside the console route tree. */
const HomeRow = (props: {
  label: string
  rail: boolean
  onNavigate: () => void
}) => (
  <Row label={props.label} rail={props.rail}>
    <Box
      as="button"
      type="button"
      title={props.label}
      display="flex"
      alignItems="center"
      justifyContent={props.rail ? "center" : "flex-start"}
      h={ITEM_HEIGHT}
      w="$full"
      px={props.rail ? "$0" : "$2_5"}
      rounded="$lg"
      cursor="pointer"
      textAlign="left"
      css={{
        gap: "10px",
        border: "none",
        background: "transparent",
        color: "$neutral12",
        fontSize: "13.5px",
        fontWeight: "600",
        lineHeight: "1",
        transition: "background-color .15s ease",
        "& svg": { fontSize: "17px", flexShrink: "0" },
        _hover: { backgroundColor: hoverColor() },
        _focusVisible: {
          outline: "none",
          boxShadow: `0 0 0 2px ${tokenVar("$info8")}`,
        },
      }}
      onClick={() => {
        props.onNavigate()
        window.open(joinBase("/"), "_self")
      }}
    >
      <Icon as={FiHome} aria-hidden="true" />
      <Show when={!props.rail}>
        <Box as="span">{props.label}</Box>
      </Show>
    </Box>
  </Row>
)

const Section = (props: {
  section: NavSection
  rail: boolean
  searching: boolean
  onNavigate: () => void
}) => {
  const t = useT()
  const { pathname } = useRouter()
  const items = () => props.section.items
  // The section holding the current page is always revealed, even if folded.
  const containsActive = () => items().some((item) => item.to === pathname())
  const open = () =>
    props.searching || containsActive() || !isSectionFolded(props.section.id)
  return (
    <VStack w="$full" spacing="$1" alignItems="stretch">
      <Show when={!props.rail} fallback={<NavRule my="$1_5" />}>
        <Box
          as="button"
          type="button"
          w="$full"
          display="flex"
          alignItems="center"
          h="28px"
          px="$1_5"
          rounded="$md"
          cursor="pointer"
          aria-expanded={open()}
          onClick={() => toggleSection(props.section.id)}
          css={{
            gap: "6px",
            border: "none",
            background: "transparent",
            textAlign: "left",
            color: "$neutral10",
            fontSize: "11px",
            fontWeight: "600",
            letterSpacing: ".06em",
            textTransform: "uppercase",
            lineHeight: "1",
            _hover: { backgroundColor: hoverColor(), color: "$neutral11" },
            _focusVisible: {
              outline: "none",
              boxShadow: `0 0 0 2px ${tokenVar("$info8")}`,
            },
          }}
        >
          <Icon
            as={FiChevronDown}
            size={13}
            aria-hidden="true"
            css={{
              transition: "transform .18s ease",
              transform: open() ? "none" : "rotate(-90deg)",
            }}
          />
          <Heading
            as="span"
            fontSize="$sm"
            fontWeight="inherit"
            color="inherit"
            letterSpacing="inherit"
          >
            {t(props.section.title)}
          </Heading>
        </Box>
      </Show>
      <Show when={props.rail || open()}>
        <VStack w="$full" spacing="$0_5" alignItems="stretch">
          <For each={items()}>
            {(item) => (
              <NavRow
                item={item}
                label={t(item.title)}
                rail={props.rail}
                onNavigate={props.onNavigate}
              />
            )}
          </For>
        </VStack>
      </Show>
    </VStack>
  )
}

/**
 * Console navigation: a searchable, sectioned list that collapses to an icon
 * rail. Rendered twice — the persistent desktop sidebar and the mobile drawer.
 */
export const SideMenu = (props: {
  rail?: boolean
  onNavigate?: () => void
}) => {
  const t = useT()
  const [query, setQuery] = createSignal("")
  const rail = () => props.rail === true
  const searching = () => query().trim().length > 0
  const matches = (title: string) =>
    !searching() ||
    t(title).toLowerCase().includes(query().trim().toLowerCase())
  const sections = createMemo(() =>
    nav_sections
      .filter((section) => isAllowed(section))
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) => isAllowed(item) && matches(item.title),
        ),
      }))
      .filter((section) => section.items.length > 0),
  )
  return (
    <VStack w="$full" spacing="$1" alignItems="stretch" p="$2">
      <Show when={!rail()}>
        <Box position="relative" w="$full" pb="$1">
          <Icon
            as={FiSearch}
            position="absolute"
            left="$2_5"
            css={{ top: "9px", transform: "translateY(-50%)" }}
            color="$neutral10"
            size={14}
            aria-hidden="true"
            pointerEvents="none"
          />
          <Input
            aria-label={t("manage.nav_search_placeholder")}
            placeholder={t("manage.nav_search_placeholder")}
            value={query()}
            onInput={(e) => setQuery(e.currentTarget.value)}
            size="sm"
            borderRadius="$lg"
            css={{
              paddingLeft: "32px",
              fontSize: "13px",
              backgroundColor: "transparent",
            }}
          />
        </Box>
      </Show>
      <HomeRow
        label={t("manage.sidemenu.home")}
        rail={rail()}
        onNavigate={() => props.onNavigate?.()}
      />
      <NavRule />
      <For each={sections()}>
        {(section) => (
          <Section
            section={section}
            rail={rail()}
            searching={searching()}
            onNavigate={() => props.onNavigate?.()}
          />
        )}
      </For>
      <Show when={searching() && sections().length === 0}>
        <Heading px="$2" fontSize="$sm" color="$neutral10" fontWeight="500">
          {t("manage.nav_search_empty")}
        </Heading>
      </Show>
    </VStack>
  )
}
