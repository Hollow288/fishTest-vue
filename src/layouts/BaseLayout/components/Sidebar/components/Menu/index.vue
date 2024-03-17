<script setup lang="ts">
import {MenuInst, MenuOption} from "naive-ui"
import NavigationIcon from '~icons/mdi/compass-outline'

const resultMenuList = ref([])

const { t } = i18n.global
const { renderIcon: renderMenuIcon, renderMenuLabel } = RenderUtils

const route = useRoute()
const router = useRouter()
const sidebarStore = useSidebarStore()

const menuInstRef = ref<MenuInst | null>(null)
const menuData = ref(resultMenuList)
const accordion = ref(false)
const selectedKey = ref()

const handleChangeRouter = () => {
  selectedKey.value = route.name
  menuInstRef.value?.showOption(route.name as string)
}

// 递归函数，处理菜单选项
const processMenuOptions =  (options, t) => {
  return options.map(option => {
    const label = renderMenuLabel(() => t(option.label))
    const key = option.key
    // const icon = renderMenuIcon(option.icon)
    const icon = renderMenuIcon('@/icons/lucide/server-off')
    // const icon =  renderMenuIcon(NavigationIcon)
    let children = null
    if (option.children && option.children.length > 0) {
      children = processMenuOptions(option.children, t) // 递归处理子菜单
    }

    return {
      label,
      key,
      icon,
      children
    }
  })
}

const queryMenuList = async () => {

  const {data} = await CommonAPI.allMenuAndChildren()

  resultMenuList.value = await processMenuOptions(data, t)

}




watch(
  () => route.name,
  () => handleChangeRouter(),
  { immediate: true }
)

const handleChangeMenu = (key: string, item: MenuOption) => {
  if (item.children) {
    return
  }
  router.push({ name: key })
}


onMounted(() => queryMenuList())
</script>

<template>
  <div class="h-[calc(100%-96px)]">
    <NScrollbar :size="10">
      <NMenu
        ref="menuInstRef"
        class="mt-[-4px]"
        :collapsed-icon-size="20"
        :collapsed="sidebarStore.isCollapse"
        :options="menuData"
        :collapsed-width="64"
        :root-indent="18"
        :indent="26"
        :value="selectedKey"
        :accordion="accordion"
        @update:value="handleChangeMenu"
      />
    </NScrollbar>
  </div>
</template>
