import type {RouteRecordRaw} from 'vue-router'
import type {Router} from '@/types/api/router'

import {CompassOutline,
  CubeOutline,
  PeopleOutline,
  Menu,
  SettingsOutline,
  ShirtOutline,
  ChatbubbleEllipsesOutline,
  ConstructOutline,
  QrCodeOutline,
  ClipboardOutline,
  PrintOutline,
  LogoWebComponent,
  CodeSlash,
  BarcodeSharp,
  Alert,
  PodiumOutline,
  PricetagOutline,
  AlbumsOutline,
  TimeOutline,
  CloudOfflineOutline,
  Ban,
  AlertCircleOutline,
  UnlinkOutline,
  PersonOutline,
  KeyOutline,
  FileTrayStackedOutline,
  ReaderOutline,
  SparklesOutline,
  NewspaperOutline,
  IdCardOutline,
  ImagesOutline,
  CalendarNumberOutline,
  CartOutline,
  AtOutline} from '@vicons/ionicons5'


const icons = {
  CompassOutline,
  CartOutline,
  CalendarNumberOutline,
  CubeOutline,
  IdCardOutline,
  ImagesOutline,
  PeopleOutline,
  Menu,
  ShirtOutline,
  ChatbubbleEllipsesOutline,
  ConstructOutline,
  QrCodeOutline,
  ClipboardOutline,
  PrintOutline,
  LogoWebComponent,
  CodeSlash,
  BarcodeSharp,
  SettingsOutline,
  Alert,
  PodiumOutline,
  PricetagOutline,
  AlbumsOutline,
  TimeOutline,
  CloudOfflineOutline,
  Ban,
  AlertCircleOutline,
  UnlinkOutline,
  PersonOutline,
  KeyOutline,
  FileTrayStackedOutline,
  ReaderOutline,
  SparklesOutline,
  NewspaperOutline,
  AtOutline
}

const { t } = i18n.global

const modules = import.meta.glob([
  '@/views/**/*.vue',
  '@/layouts/**/*.vue',
  '@/pages/**/*.vue'
])

debugger

function convertMenuToRoute(menu: Router): RouteRecordRaw {
  const route: RouteRecordRaw = {
    path: menu.path,
    name: menu.name,
    component: modules[`/src${menu.component}/index.vue`],
    meta: {
      title: () => t(menu.title),
      icon: icons[menu.icon],
      disableAuth: menu.disableAuth === '1',
      dismissTab: menu.dismissTab === '1'
    }
  }

  if (menu.children) {
    route.children = menu.children.map(convertMenuToRoute)
  }

  return route
}

function convertMenusToRoutes(menus: Router[]): RouteRecordRaw[] {
  return menus.map(convertMenuToRoute)
}


export const routes = async () =>{
  const {data} = await CommonAPI.allRouterAndChildren()
  return convertMenusToRoutes(data)
}
