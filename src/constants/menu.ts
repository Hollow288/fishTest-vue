import {CompassOutline,
  CubeOutline,
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
  Alert,
  PodiumOutline,
  PricetagOutline,
  AlbumsOutline,
  SettingsOutline,
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
  AtOutline} from '@vicons/ionicons5'


const icons = {
  CompassOutline,
  ImagesOutline,
  CubeOutline,
  IdCardOutline,
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
const { renderIcon: renderMenuIcon, renderMenuLabel } = RenderUtils

async function processMenuOptions(options, t) {
  const processedOptions = await Promise.all(options.map(async (option) => {
    const label = renderMenuLabel(() => t(option.label))
    const { key } = option
    const icon = renderMenuIcon(icons[option.icon]) // 调用 renderIcon 处理图标大小
    let children = null
    if (option.children && option.children.length > 0) {
      children = await processMenuOptions(option.children, t) // 递归处理子菜单
    }

    return {
      label,
      key,
      icon,
      children
    }
  }))

  return processedOptions
}

export const menuOptions = async () => {
  const {data} = await CommonAPI.allMenuAndChildren()
  return processMenuOptions(data, t)
}
