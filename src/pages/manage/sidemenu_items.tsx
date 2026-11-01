import {
  BsGearFill,
  BsPaletteFill,
  BsCameraFill,
  BsWindow,
  BsPersonCircle,
  BsJoystick,
  BsMedium,
  BsBraces,
  BsFingerprint,
  BsFront,
  BsCloudUploadFill,
  BsSearch,
  BsBucket,
  BsHddNetwork,
  BsArrowLeftRight,
  BsCollectionPlay,
} from "solid-icons/bs"
import { FiLogIn, FiCpu, FiUsers } from "solid-icons/fi"
import { SiMetabase } from "solid-icons/si"
import { CgDatabase, CgShare } from "solid-icons/cg"
import { OcWorkflow2 } from "solid-icons/oc"
import { IoCopy, IoMove, IoMagnetOutline } from "solid-icons/io"
import { TbArchive, TbSeeding } from "solid-icons/tb"
import { lazy } from "solid-js"
import { Group, UserRole } from "~/types"
import {
  FaSolidBook,
  FaSolidDatabase,
  FaSolidPuzzlePiece,
} from "solid-icons/fa"
import { NavSection, SideMenuItem, SideMenuItemProps } from "./nav_types"

const CommonSettings = lazy(() => import("./settings/Common"))

/**
 * The console navigation, in the order an operator reads it:
 * configuration, running work, resources, media, then support.
 *
 * Sections only drive presentation. The route table is built from
 * `side_menu_items` (see routes.tsx), which also carries the two pages that
 * live in the avatar menu instead of the sidebar.
 */
export const nav_sections: NavSection[] = [
  {
    id: "settings",
    title: "manage.sidemenu.settings",
    items: [
      {
        title: "manage.sidemenu.site",
        icon: BsWindow,
        to: "/@manage/settings/site",
        component: () => <CommonSettings group={Group.SITE} />,
      },
      {
        title: "manage.sidemenu.style",
        icon: BsPaletteFill,
        to: "/@manage/settings/style",
        component: () => <CommonSettings group={Group.STYLE} />,
      },
      {
        title: "manage.sidemenu.preview",
        icon: BsCameraFill,
        to: "/@manage/settings/preview",
        component: () => <CommonSettings group={Group.PREVIEW} />,
      },
      {
        title: "manage.sidemenu.global",
        icon: BsJoystick,
        to: "/@manage/settings/global",
        component: () => <CommonSettings group={Group.GLOBAL} />,
      },
      {
        title: "manage.sidemenu.seed",
        icon: TbSeeding,
        to: "/@manage/settings/seed",
        component: lazy(() => import("./settings/Seed")),
      },
      {
        title: "manage.sidemenu.sso",
        icon: FiLogIn,
        to: "/@manage/settings/sso",
        component: () => <CommonSettings group={Group.SSO} />,
      },
      {
        title: "manage.sidemenu.ldap",
        icon: FiUsers,
        to: "/@manage/settings/ldap",
        component: () => <CommonSettings group={Group.LDAP} />,
      },
      {
        title: "manage.sidemenu.s3",
        icon: BsBucket,
        to: "/@manage/settings/s3",
        backend: ["go"],
        component: lazy(() => import("./settings/S3")),
      },
      {
        title: "manage.sidemenu.ftp",
        icon: BsHddNetwork,
        to: "/@manage/settings/ftp",
        component: () => <CommonSettings group={Group.FTP} />,
      },
      {
        title: "manage.sidemenu.traffic",
        icon: BsArrowLeftRight,
        to: "/@manage/settings/traffic",
        component: () => <CommonSettings group={Group.TRAFFIC} />,
      },
      {
        title: "manage.sidemenu.transcode",
        icon: FiCpu,
        to: "/@manage/settings/transcode",
        component: () => <CommonSettings group={Group.TRANSCODE} />,
      },
      {
        title: "manage.sidemenu.other",
        icon: BsMedium,
        to: "/@manage/settings/other",
        component: lazy(() => import("./settings/Other")),
      },
    ],
  },
  {
    id: "tasks",
    title: "manage.sidemenu.tasks",
    icon: OcWorkflow2,
    role: UserRole.GENERAL,
    backend: ["go"],
    items: [
      {
        title: "manage.sidemenu.offline_download",
        icon: IoMagnetOutline,
        to: "/@manage/tasks/offline_download",
        role: UserRole.GENERAL,
        component: lazy(() => import("./tasks/offline_download")),
      },
      {
        title: "manage.sidemenu.upload",
        icon: BsCloudUploadFill,
        to: "/@manage/tasks/upload",
        role: UserRole.GENERAL,
        component: lazy(() => import("./tasks/Upload")),
      },
      {
        title: "manage.sidemenu.copy",
        icon: IoCopy,
        to: "/@manage/tasks/copy",
        role: UserRole.GENERAL,
        component: lazy(() => import("./tasks/Copy")),
      },
      {
        title: "manage.sidemenu.move",
        icon: IoMove,
        to: "/@manage/tasks/move",
        role: UserRole.GENERAL,
        component: lazy(() => import("./tasks/Move")),
      },
      {
        title: "manage.sidemenu.decompress",
        icon: TbArchive,
        to: "/@manage/tasks/decompress",
        role: UserRole.GENERAL,
        component: lazy(() => import("./tasks/Decompress")),
      },
    ],
  },
  {
    id: "resources",
    title: "manage.section.resources",
    items: [
      {
        title: "manage.sidemenu.users",
        icon: BsPersonCircle,
        to: "/@manage/users",
        component: lazy(() => import("./users/Users")),
      },
      {
        title: "manage.sidemenu.storages",
        icon: CgDatabase,
        to: "/@manage/storages",
        component: lazy(() => import("./storages/Storages")),
      },
      {
        title: "manage.sidemenu.plugins",
        icon: FaSolidPuzzlePiece,
        to: "/@manage/plugins",
        backend: ["ts-worker"],
        component: lazy(() => import("./plugins")),
      },
      {
        title: "manage.sidemenu.shares",
        icon: CgShare,
        to: "/@manage/shares",
        role: UserRole.GENERAL,
        component: lazy(() => import("./shares/Shares")),
      },
      {
        title: "manage.sidemenu.metas",
        icon: SiMetabase,
        to: "/@manage/metas",
        component: lazy(() => import("./metas/Metas")),
      },
      {
        title: "manage.sidemenu.indexes",
        icon: BsSearch,
        to: "/@manage/indexes",
        component: lazy(() => import("./indexes/index_page")),
      },
      {
        title: "manage.sidemenu.backup-restore",
        icon: FaSolidDatabase,
        to: "/@manage/backup-restore",
        component: lazy(() => import("./backup-restore")),
      },
    ],
  },
  {
    id: "media",
    title: "manage.sidemenu.media",
    items: [
      {
        title: "manage.sidemenu.media_settings",
        icon: BsGearFill,
        to: "/@manage/media/settings",
        component: lazy(() => import("./media/MediaSettingsPage")),
      },
      {
        title: "manage.sidemenu.media_scrape",
        icon: BsSearch,
        to: "/@manage/media/scrape",
        component: lazy(() => import("./media/MediaScrapePage")),
      },
      {
        title: "manage.sidemenu.media_strm",
        icon: BsBraces,
        to: "/@manage/media/strm",
        component: lazy(() => import("./media/MediaStrmPage")),
      },
      {
        title: "manage.sidemenu.media_transcode",
        icon: FiCpu,
        to: "/@manage/media/transcode",
        component: () => <CommonSettings group={Group.TRANSCODE} />,
      },
      {
        title: "manage.sidemenu.media_video",
        icon: BsCollectionPlay,
        to: "/@manage/media/video",
        component: lazy(() =>
          import("./media/MediaManage").then((m) => ({
            default: m.VideoManage,
          })),
        ),
      },
      {
        title: "manage.sidemenu.media_music",
        icon: BsFront,
        to: "/@manage/media/music",
        component: lazy(() =>
          import("./media/MediaManage").then((m) => ({
            default: m.MusicManage,
          })),
        ),
      },
      {
        title: "manage.sidemenu.media_image",
        icon: BsCameraFill,
        to: "/@manage/media/image",
        component: lazy(() =>
          import("./media/MediaManage").then((m) => ({
            default: m.ImageManage,
          })),
        ),
      },
      {
        title: "manage.sidemenu.media_book",
        icon: FaSolidBook,
        to: "/@manage/media/book",
        component: lazy(() =>
          import("./media/MediaManage").then((m) => ({
            default: m.BookManage,
          })),
        ),
      },
    ],
  },
  {
    id: "support",
    title: "manage.section.support",
    items: [
      {
        title: "manage.sidemenu.about",
        icon: BsFront,
        to: "/@manage/about",
        role: UserRole.GUEST,
        component: lazy(() => import("./About")),
      },
      {
        title: "manage.sidemenu.docs",
        icon: FaSolidBook,
        to: "https://doc.oplist.org",
        role: UserRole.GUEST,
        external: true,
      },
    ],
  },
]

/**
 * Pages that live in the avatar menu rather than the sidebar: Profile and the
 * developer token console. They still need routes, so they stay in the flat
 * list the route table is built from.
 */
export const route_only_items: SideMenuItemProps[] = [
  {
    title: "manage.sidemenu.profile",
    icon: BsFingerprint,
    to: "/@manage",
    role: UserRole.GUEST,
    component: lazy(() => import("./users/Profile")),
  },
  {
    title: "manage.sidemenu.developer",
    icon: BsBraces,
    to: "/@manage/developer",
    role: UserRole.GUEST,
    component: lazy(() => import("./Developer")),
  },
]

/** Flat list every leaf of the navigation, used to build the route table. */
export const side_menu_items: SideMenuItem[] = [
  ...route_only_items,
  ...nav_sections.flatMap((section) => section.items),
]

export type { NavSection, SideMenuItem, SideMenuItemProps } from "./nav_types"
