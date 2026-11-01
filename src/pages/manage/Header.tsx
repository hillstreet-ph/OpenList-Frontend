import {
  Avatar,
  Box,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Heading,
  HStack,
  Icon,
  IconButton,
  Image,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
  Tooltip,
  useColorModeValue,
} from "@hope-ui/solid"
import { Show } from "solid-js"
import { IconTypes } from "solid-icons"
import { TiThMenu } from "solid-icons/ti"
import {
  BsBraces,
  BsFront,
  BsLayoutSidebar,
  BsLayoutSidebarReverse,
} from "solid-icons/bs"
import {
  FiChevronDown,
  FiHome,
  FiLogOut,
  FiSettings,
  FiUser,
} from "solid-icons/fi"
import { FaSolidBook } from "solid-icons/fa"
import { SwitchColorMode, SwitchLanguageWhite } from "~/components"
import { useFetch, useRouter, useT } from "~/hooks"
import { navCollapsed, navDrawer, setNavCollapsed } from "./nav_state"
import { changeToken, handleResp, joinBase, notify, r, tokenVar } from "~/utils"
import { PResp } from "~/types"
import { getSetting, me } from "~/store"
import { SideMenu } from "./SideMenu"

const [logOutReqLoading, logOutReq] = useFetch((): PResp<any> =>
  r.get("/auth/logout"),
)

const BrandFallback = () => <Box w="$6" h="$6" />

/**
 * Brand mark. Operators can configure a logo in Site settings; when that is
 * empty the console falls back to a drawn "OB" tile, so the shell always reads
 * as a product instead of an unnamed admin form.
 */
const BrandMark = () => {
  const logos = getSetting("logo").split("\n")
  const logo = useColorModeValue(logos[0], logos.pop())
  return (
    <Show
      when={logo()}
      fallback={
        <Box
          w="$6"
          h="$6"
          rounded="$md"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bgColor="$info9"
          css={{ flexShrink: "0" }}
        >
          <Heading
            as="span"
            fontSize="11px"
            fontWeight="700"
            color="white"
            letterSpacing=".02em"
          >
            OB
          </Heading>
        </Box>
      }
    >
      <Image
        src={logo()}
        alt="Open-Box"
        w="$6"
        h="$6"
        fallback={<BrandFallback />}
        css={{ objectFit: "contain", flexShrink: "0" }}
      />
    </Show>
  )
}

const MenuAction = (props: {
  icon: IconTypes
  label: string
  onClick: () => void
  danger?: boolean
}) => (
  <MenuItem
    onClick={props.onClick}
    css={{
      gap: "10px",
      fontSize: "13.5px",
      fontWeight: "500",
      color: props.danger ? "$danger9" : "$neutral12",
      _hover: {
        backgroundColor: props.danger ? "$danger2" : "$neutral3",
      },
    }}
  >
    <Icon as={props.icon} size={15} aria-hidden="true" />
    {props.label}
  </MenuItem>
)

const TriggerCss = {
  display: "flex",
  alignItems: "center",
  gap: "9px",
  padding: "5px 8px",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  transition: "background-color .15s ease",
  _hover: { backgroundColor: "rgba(132,133,141,0.14)" },
  _focusVisible: {
    outline: "none",
    boxShadow: `0 0 0 2px ${tokenVar("$info8")}`,
  },
}

const Header = () => {
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
  return (
    <Box
      as="header"
      position="sticky"
      top="0"
      left="0"
      right="0"
      zIndex="$sticky"
      h="$15"
      flexShrink={0}
      px="$3"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      bgColor={useColorModeValue("$background", "$neutral2")()}
      css={{
        borderBottom: `1px solid ${tokenVar(rule())}`,
        gap: "12px",
      }}
    >
      <HStack spacing="$1" alignItems="center">
        {/* Below the desktop breakpoint the sidebar becomes a drawer. */}
        <IconButton
          aria-label={t("manage.nav_open")}
          icon={<TiThMenu />}
          size="sm"
          variant="ghost"
          display={{ "@lg": "none" }}
          onClick={navDrawer.onOpen}
        />
        <Show
          when={!navCollapsed()}
          fallback={
            <Tooltip label={t("manage.nav_expand")} placement="bottom">
              <IconButton
                aria-label={t("manage.nav_expand")}
                icon={<BsLayoutSidebarReverse />}
                size="sm"
                variant="ghost"
                display={{ "@initial": "none", "@lg": "flex" }}
                onClick={() => setNavCollapsed(false)}
              />
            </Tooltip>
          }
        >
          <Tooltip label={t("manage.nav_collapse")} placement="bottom">
            <IconButton
              aria-label={t("manage.nav_collapse")}
              icon={<BsLayoutSidebar />}
              size="sm"
              variant="ghost"
              display={{ "@initial": "none", "@lg": "flex" }}
              onClick={() => setNavCollapsed(true)}
            />
          </Tooltip>
        </Show>
        <Menu placement="bottom-start">
          <MenuTrigger
            as={Box}
            aria-label="Open-Box"
            rounded="$lg"
            css={TriggerCss}
          >
            <BrandMark />
            <Heading
              as="span"
              fontSize="$lg"
              fontWeight="600"
              letterSpacing="-.01em"
            >
              {t("manage.brand")}
            </Heading>
            <Icon
              as={FiChevronDown}
              size={13}
              color="$neutral10"
              aria-hidden="true"
            />
          </MenuTrigger>
          <MenuContent minW="230px">
            <MenuAction
              icon={FiHome}
              label={t("manage.sidemenu.home")}
              onClick={() => window.open(joinBase("/"), "_self")}
            />
            <MenuAction
              icon={FaSolidBook}
              label={t("manage.sidemenu.docs")}
              onClick={() => window.open("https://doc.oplist.org", "_blank")}
            />
            <MenuAction
              icon={BsFront}
              label={t("manage.sidemenu.about")}
              onClick={() => to("/@manage/about")}
            />
            <Divider />
            <MenuAction
              icon={BsBraces}
              label={t("manage.sidemenu.developer")}
              onClick={() => to("/@manage/developer")}
            />
            <MenuAction
              icon={FiLogOut}
              label={t("manage.logout")}
              onClick={logOut}
              danger
            />
          </MenuContent>
        </Menu>
      </HStack>
      <HStack spacing="$1" alignItems="center">
        <SwitchLanguageWhite />
        <SwitchColorMode />
        <Menu placement="bottom-end">
          <MenuTrigger
            as={Box}
            aria-label={t("manage.sidemenu.profile")}
            rounded="$md"
            css={TriggerCss}
          >
            <Avatar
              size="sm"
              bg="$info9"
              name={me().username || undefined}
              getInitials={(name) => name.slice(0, 1).toUpperCase()}
              iconLabel={t("manage.sidemenu.profile")}
              icon={() => <Icon as={FiUser} size={14} aria-hidden="true" />}
            />
            <Heading
              as="span"
              fontSize="$sm"
              fontWeight="500"
              color="$neutral11"
              display={{ "@initial": "none", "@md": "inline" }}
            >
              {me().username}
            </Heading>
          </MenuTrigger>
          <MenuContent minW="220px">
            <Box
              px="$3"
              py="$2"
              css={{ borderBottom: `1px solid ${tokenVar(rule())}` }}
            >
              <Heading
                as="span"
                fontSize="$sm"
                fontWeight="600"
                display="block"
                color="$neutral12"
              >
                {me().username || t("manage.sidemenu.profile")}
              </Heading>
            </Box>
            <MenuAction
              icon={FiUser}
              label={t("manage.sidemenu.profile")}
              onClick={() => to("/@manage")}
            />
            <MenuAction
              icon={BsBraces}
              label={t("manage.sidemenu.developer")}
              onClick={() => to("/@manage/developer")}
            />
            <MenuAction
              icon={FiSettings}
              label={t("manage.sidemenu.settings")}
              onClick={() => to("/@manage/settings/site")}
            />
            <Divider />
            <MenuAction
              icon={FiLogOut}
              label={t("manage.logout")}
              onClick={logOut}
              danger
            />
          </MenuContent>
        </Menu>
      </HStack>
      {/* Mobile navigation drawer shares the sidebar component. */}
      <Drawer
        opened={navDrawer.isOpen()}
        placement="left"
        onClose={navDrawer.onClose}
      >
        <DrawerOverlay />
        <DrawerContent maxW="290px">
          <DrawerCloseButton />
          <DrawerHeader color="$info11">{t("manage.title")}</DrawerHeader>
          <DrawerBody p="$0">
            <SideMenu onNavigate={navDrawer.onClose} />
            <HStack spacing="$4" p="$2" color="$neutral11">
              <SwitchLanguageWhite />
              <SwitchColorMode />
            </HStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  )
}

export { Header }
