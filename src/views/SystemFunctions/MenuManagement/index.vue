<script lang="ts">
// import type {Lang} from '@dolphin-admin/utils'
import {Filter as FilterIcon, Reload as ReloadIcon, AddSharp} from '@vicons/ionicons5'
import type {DataTableColumns, DropdownOption} from 'naive-ui'
import {NIcon, useMessage} from 'naive-ui'

import {BasePageModel} from '@/constants'
// const {t} = useI18n<{ message: MessageSchema }, Lang>({})
import i18n from '@/i18n'
import type {Menu} from '@/types/api/menu'
import CheckIcon from '~icons/ic/baseline-check'

import {MenuFormModal} from './components'

// import type { MessageSchema } from '@/types'


const menuFormModalRef = ref()
const menuFormData = ref({})
const isMenuEdit = ref(true)
const menuRightClickData = ref({})
const dataRef = ref<Menu[]>([])

const {t} = i18n.global

const showDropdownRef = ref(false)

const loadingRef = ref(true)

const xRef = ref(0)
const yRef = ref(0)


const moveOptions: DropdownOption[] = [
  {
    label: '编辑',
    key: 'edit',
  },
  {
    label: () => h('span', {style: {color: 'red'}}, '删除'),
    key: 'delete',
  },
  {
    label: '添加同级',
    key: 'addSiblings',
  },
  {
    label: '添加子级',
    key: 'addChildren',
  }
]

const paginationReactive = reactive({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [
    {
      label: t('COMMON.EachPage10', {count: 10}),
      value: 10
    },
    {
      label: t('COMMON.EachPage20', {count: 20}),
      value: 20
    },
    {
      label: t('COMMON.EachPage30', {count: 30}),
      value: 30
    },
    {
      label: t('COMMON.EachPage50', {count: 50}),
      value: 50
    }
  ],
  onChange: (page: number) => {
    paginationReactive.page = page
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    queryList()
  },
  onUpdatePageSize: (pageSize: number) => {
    paginationReactive.pageSize = pageSize
    paginationReactive.page = 1
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    queryList()
  },
  prefix: (info) => t('COMMON.TotalPage', {totalPage: info.itemCount})
})


const queryListOnlyMenu = () => {
  loadingRef.value = true

  const params = new BasePageModel({
    page: paginationReactive.page,
    pageSize: paginationReactive.pageSize,
  })

  MenuAPI.listOnlyMenu(params).then((result => {
    const {data, total} = result.data ?? {}

    dataRef.value = data.map(menu =>
      ({
        ...menu,
        visible: menu.visible == 0,
        status: menu.status == 0,
        disableAuth: menu.disableAuth == 0,
        dismissTab: menu.dismissTab == 0,
        isLeaf: menu.isLeaf == 0
      })
    )
    paginationReactive.itemCount = total
    loadingRef.value = false
  }))
}




const queryList = () => {

  loadingRef.value = true

  const params = new BasePageModel({
    page: paginationReactive.page,
    pageSize: paginationReactive.pageSize,
  })

  MenuAPI.list(params).then((result => {
    const {data, total} = result.data ?? {}

    dataRef.value = data.map(menu =>
      ({
        ...menu,
        visible: menu.visible == 0,
        status: menu.status == 0,
        disableAuth: menu.disableAuth == 0,
        dismissTab: menu.dismissTab == 0,
        isLeaf: menu.isLeaf == 0
      })
    )
    paginationReactive.itemCount = total
    loadingRef.value = false
  }))
}


const ShowOrEdit = defineComponent({
  props: {
    value: [String, Number],
    onUpdateValue: [Function, Array],
    row: {}
  },
  setup(props) {
    const isEdit = ref(false)
    const inputRef = ref(null)
    const inputValue = ref(props.value)
    const rowValue = ref(props.row)


    function handleOnClick() {
      isEdit.value = true
      nextTick(() => {
        inputRef.value.focus()
      })
    }

    function handleChange() {
      props.onUpdateValue(inputValue.value)
      isEdit.value = false
      if (isNaN(inputValue.value)) {
        window.$message.destroyAll()
        window.$message.error('排序只能是数字')
        queryList()
      } else {
        // debugger
        // console.log(rowValue.value.menuId)
        // console.log(v)
        MenuAPI.reviseMenuSortById(rowValue.value.menuId, inputValue.value).then(result => {
          const {code, message} = result ?? {}
          if (code === 200) {
            window.$message.destroyAll()
            window.$message.success(message)
            // thisOperation.menuId = rowValue.value.menuId
            queryList()
          } else {
            window.$message.destroyAll()
            window.$message.error(message)
            queryList()
          }

        })
      }


    }

    return () =>
      h(
        'div',
        {
          style: 'min-height: 22px',
          onClick: handleOnClick
        },
        isEdit.value
          ? h(NInput, {
            ref: inputRef,
            value: inputValue.value,
            onUpdateValue: (v) => {
              inputValue.value = v
            },
            // type: 'number',
            onChange: handleChange,
            onBlur: handleChange
          })
          : props.value
      )
  }
})


export default defineComponent({
  components: {NIcon, MenuFormModal},
  setup() {

    const getDataIndex = (menuId) => dataRef.value.findIndex((item) => item.menuId === menuId)

    window.$message = useMessage()

    const colsReactive: DataTableColumns = [
      {
        title: 'No.',
        key: 'no'
      },
      {
        title: 'Title',
        key: 'title'
      },
      {
        title: 'Length',
        key: 'length'
      }
    ]

    const columns: ({ width: number; title: string; key: string } | { title: () => string; key: string } | {
      width: number;
      title: () => string;
      align: string;
      render: (row) => VNode<RendererNode, RendererElement, { [p: string]: any }>;
      key: string;
      titleAlign: string
    } | {
      width: number;
      fixed: string;
      title: () => string;
      align: string;
      render(row): VNode<RendererNode, RendererElement, { [p: string]: any }>;
      key: string
    })[] = [
      {key: 'menuId', title: 'ID', width: 100},
      {key: 'keyName', title: () => t('TEMP.MenuManagement.keyName')},
      {key: 'title', title: () => t('TEMP.MenuManagement.title')},
      {key: 'label', title: () => t('TEMP.MenuManagement.label')},
      {key: 'path', title: () => t('TEMP.MenuManagement.path')},
      {key: 'icon', title: () => t('TEMP.MenuManagement.icon')},
      {key: 'component', title: () => t('TEMP.MenuManagement.component')},
      {
        title: () => t('TEMP.MenuManagement.visible'),
        key: 'visible',
        width: 100,
        titleAlign: 'center',
        align: 'center',
        render: (row) =>
          row.visible &&
          h(CheckIcon, {
            class: 'inline'
          })
      },
      {
        title: () => t('TEMP.MenuManagement.status'),
        key: 'status',
        width: 100,
        titleAlign: 'center',
        align: 'center',
        render: (row) =>
          row.status &&
          h(CheckIcon, {
            class: 'inline'
          })
      },
      {
        title: () => t('TEMP.MenuManagement.DisableAuth'),
        key: 'disableAuth',
        width: 100,
        titleAlign: 'center',
        align: 'center',
        render: (row) =>
          row.disableAuth &&
          h(CheckIcon, {
            class: 'inline'
          })
      },
      {
        title: () => t('TEMP.MenuManagement.DismissTab'),
        key: 'dismissTab',
        width: 100,
        titleAlign: 'center',
        align: 'center',
        render: (row) =>
          row.dismissTab &&
          h(CheckIcon, {
            class: 'inline'
          })
      },
      {
        title: () => t('COMMON.SORT'),
        key: 'sort',
        align: 'center',
        render(row, indexs) {
          return h(ShowOrEdit, {
            value: row.sort,
            onUpdateValue(v) {
              const index = getDataIndex(row.menuId)
              if (index === -1) {
                // debugger
                console.log("row = " + row)
                console.log("indexs = " + indexs)
              } else {
                dataRef.value[index].sort = v
              }

            },
            row
          })
        },
        width: 120,
        fixed: 'right'
      }
    ]

    // type datae = {
    //   id: string
    //   key: string
    //   example: string
    //   isLeaf: boolean
    //   children: []
    // }

    // const dataRef = ref([
    //   { id: '1', key: 'p1', example: 'p1', isLeaf: false ,children: []},
    //   { id: '2', key: 'p2', example: 'p2', isLeaf: false ,children: []},
    //   { id: '1', key: 'p3', example: 'p1', isLeaf: false ,children: []},
    //   { id: '2', key: 'p4', example: 'p2', isLeaf: false ,children: []},
    //   { id: '1', key: 'p5', example: 'p1', isLeaf: false ,children: []},
    //   { id: '2', key: 'p6', example: 'p2', isLeaf: false ,children: []},
    //   { id: '1', key: 'p7', example: 'p1', isLeaf: false ,children: []},
    //   { id: '2', key: 'p8', example: 'p2', isLeaf: false ,children: []},
    //   { id: '1', key: 'p9', example: 'p1', isLeaf: false ,children: []},
    //   { id: '2', key: 'p10', example: 'p2', isLeaf: false ,children: []},
    //   { id: '3', key: 'p11', example: 'p3', isLeaf: false ,children: []}
    // ])

    // const tableButton = (row) => {
    //   // eslint-disable-next-line eqeqeq
    //   if (row.id == 1) {
    //     return [
    //       h(
    //         NButton,
    //         {
    //           type: 'default',
    //           size: 'small',
    //           onClick: () => {
    //           }
    //         },
    //         {
    //           default: () => t('COMMON.MoveDown')
    //         }
    //       )
    //     ]
    //   }
    //   if (row.id == dataRef.value.length) {
    //     return [
    //       h(
    //         NButton,
    //         {
    //           type: 'default',
    //           size: 'small',
    //           onClick: () => {
    //           }
    //         },
    //         {
    //           default: () => t('COMMON.MoveUp')
    //         }
    //       )
    //     ]
    //   }
    //   return [
    //     h(
    //       NButton,
    //       {
    //         type: 'default',
    //         size: 'small',
    //         onClick: () => {
    //         }
    //       },
    //       {
    //         default: () => t('COMMON.MoveDown')
    //       }
    //     ),
    //     h(
    //       NButton,
    //       {
    //         type: 'default',
    //         size: 'small',
    //         onClick: () => {
    //         }
    //       },
    //       {
    //         default: () => t('COMMON.MoveUp')
    //       }
    //     )
    //   ]
    // }


    onMounted(() => queryList())

    return {
      cols: colsReactive,
      columns,
      data: dataRef,
      moveOptions,
      queryList,
      queryListOnlyMenu,
      FilterIcon,
      ReloadIcon,
      loading: loadingRef,
      t,
      menuFormModalRef,
      menuFormData,
      isMenuEdit,
      AddSharp,
      pagination: paginationReactive,
      onLoad(row: Record<string, unknown>) {
        return new Promise<void>((resolve) => {
          MenuAPI.menuByParentId(row.menuId).then(result => {
            row.children = result.data
          })
          resolve()
        })
      },
      showDropdown: showDropdownRef,
      x: xRef,
      y: yRef,
      handleSelect(item) {
        showDropdownRef.value = false
        if (item === 'edit') {
          isMenuEdit.value = true
          menuFormModalRef.value.handleShowModal()
          menuFormData.value = menuRightClickData.value
        }
      },
      createNewMenu(){
        isMenuEdit.value = false
        menuFormData.value = {}
        menuFormModalRef.value.handleShowModal()
        // menuFormData.value = menuRightClickData.value
      },
      onClickoutside() {
        showDropdownRef.value = false
      },
      rowProps: (row) => ({
        onContextmenu: (e: MouseEvent) => {
          menuRightClickData.value = row
          e.preventDefault()
          showDropdownRef.value = false
          nextTick().then(() => {
            showDropdownRef.value = true
            xRef.value = e.clientX
            yRef.value = e.clientY
          })
        }
      }),

      onlyMenu: () => {
        queryListOnlyMenu()
      }
    }
  }
})


</script>

<template>
  <DataTableLayout>
    <template #operate>
      <div class="flex flex-col items-center space-y-2 sm:flex-row sm:justify-between sm:space-y-0">
        <div class="flex flex-col items-center space-y-2 sm:flex-row sm:space-x-3 sm:space-y-0">
          <div class="flex w-full items-center !space-x-2 sm:w-fit ">
            <n-button icon-placement="left" secondary strong @click="onlyMenu">
              <template #icon>
                <n-icon :component="FilterIcon">
                  <!--                <AddSharp-icon />-->
                </n-icon>
              </template>
              {{ t('COMMON.OnlyMenu') }}
            </n-button>

            <n-button icon-placement="left" secondary strong @click="queryList">
              <template #icon>
                <n-icon :component="ReloadIcon">
                  <!--                <AddSharp-icon />-->
                </n-icon>
              </template>
              {{ t('COMMON.RESET') }}
            </n-button>

          </div>
        </div>

        <div class="flex w-full items-center justify-between space-x-3 sm:justify-end ">
          <n-button icon-placement="left" secondary strong @click="createNewMenu">
            <template #icon>
              <n-icon :component="AddSharp">
                <!--                <AddSharp-icon />-->
              </n-icon>
            </template>
            {{ t('COMMON.Create') }}
          </n-button>
        </div>

      </div>
    </template>
    <!--如果是后端分页,这里一定要加上remote!-->
    <n-data-table
      :key="(row) => row.key"
      remote
      :columns="columns"
      :data="data"
      :cascade="false"
      :scroll-x="3000"
      :loading="loading"
      flex-height
      allow-checking-not-loaded
      :pagination="pagination"
      :row-props="rowProps"
      @load="onLoad"
      @update:page="() => queryList()"
    />
    <n-dropdown
      placement="bottom-start"
      trigger="manual"
      :x="x"
      :y="y"
      :options="moveOptions"
      :on-clickoutside="onClickoutside"
      :show="showDropdown"
      @select="handleSelect"
    />


    <MenuFormModal
      ref="menuFormModalRef"
      :is-edit="isMenuEdit"
      :menu-form-data="menuFormData"
      @save="queryList"
    />
  </DataTableLayout>
</template>
