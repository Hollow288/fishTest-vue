<script lang="ts">
import {AddSharp, Filter as FilterIcon, Reload as ReloadIcon, TrashBinOutline} from '@vicons/ionicons5'
import {NIcon, useDialog, useMessage} from 'naive-ui'

import {CabinetRelatedAPI} from '@/api/cabinetRelated'
import {BasePageModel} from '@/constants'
import i18n from '@/i18n'
import type {Notice} from '@/types/api/notice'
import type {PortFolioType} from '@/types/api/portFolioType'
import UserAvatarIcon from '~icons/carbon/user-avatar-filled-alt'
import ResetIcon from '~icons/ic/round-refresh'
import EditIcon from '~icons/ic/sharp-edit'
import SearchIcon from '~icons/line-md/search'
import CogIcon from '~icons/mdi/cog'
import ViewIcon from '~icons/mdi/file-search-outline'
import FileExport from '~icons/tabler/FileExport'

import {PortFolioFormModal, PortFolioTypeModal} from './components'

const portFolioFormModalRef = ref()
const portFolioFormData = ref({})
const portFolioState = ref('')
const portFolioTypeModalRef = ref()
const portFolioTypeFormData = ref({})
const dataRef = ref<Notice[]>([])
const generalOptions = ref<PortFolioType>([])
const checkArray = ref([])

const {t} = i18n.global

const showDropdownRef = ref(false)

const loadingRef = ref(true)

const checkedRowKeysRef = ref<[]>([])

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


const queryParams = reactive({
  searchText: []
})

const queryType = async () => {
  const {data} = await CabinetRelatedAPI.getPortFolioType()
  generalOptions.value = data
}

const queryList = () => {

  loadingRef.value = true

  const params = new BasePageModel({
    page: paginationReactive.page,
    pageSize: paginationReactive.pageSize,
    searchText: queryParams.searchText
  })

  CabinetRelatedAPI.listPortfolioWeb(params).then((result => {
    const {data, total} = result.data ?? {}

    dataRef.value = data.map(PortFolioType =>
      ({
        ...PortFolioType
      })
    )
    paginationReactive.itemCount = total
    loadingRef.value = false
  }))
  queryType()
}


const handleReset = () => {
  queryParams.searchText = []
  paginationReactive.page = 1
  paginationReactive.pageSize = 10
  paginationReactive.itemCount = 0
  queryList()
}


export default defineComponent({
  components: {NIcon, PortFolioFormModal, SearchIcon, PortFolioTypeModal},
  setup() {


    window.$message = useMessage()

    const dialog = useDialog()


    const columns: [{ disabled(row): boolean; type: string }, {
      width: number;
      title: string;
      key: string;
      ellipsis: boolean
    }, {
      width: number;
      title: () => any;
      align: string;
      render: (row) => VNode<RendererNode, RendererElement, { [p: string]: any }>;
      key: string;
      titleAlign: string
    }, {
      width: number;
      title: () => any;
      align: string;
      render: (row) => VNode<RendererNode, RendererElement, { [p: string]: any }>;
      key: string;
      titleAlign: string
    }, {
      width: number;
      title: () => any;
      render: (row) => VNode<RendererNode, RendererElement, { [p: string]: any }>[];
      key: string
    }, { width: number; title: () => any; align: string; render: (row) => string; key: string; titleAlign: string }] = [
      {
        type: 'selection',
        disabled(row) {
          return false
        }
      },
      {key: 'folioId', title: 'ID', width: 30, ellipsis: true},
      {
        title: () => t('TEMP.Cabinet.PortfolioWeb.thumbnailUrl'),
        key: 'thumbnailUrl',
        width: 55,
        titleAlign: 'center',
        align: 'center',
        render: (row) =>
          h(
            'div',
            {
              class: 'flex align-center justify-center'
            },
            row.thumbnailUrl
              ? h(NImage, {
                src: row.thumbnailUrl,
                lazy: true,
                class: 'my-1',
                width:'100'
              })
              : h(NIcon, {
                size: '40',
                depth: '3',
                component: UserAvatarIcon
              })
          )
      },
      {
        title: () => t('TEMP.Cabinet.PortfolioWeb.panoramaUrl'),
        key: 'panoramaUrl',
        width: 55,
        titleAlign: 'center',
        align: 'center',
        render: (row) =>
          h(
            'div',
            {
              class: 'flex align-center justify-center'
            },
            row.panoramaUrl
              ? h(NImage, {
                src: row.panoramaUrl,
                lazy: true,
                class: 'my-1',
                width:'100'
              })
              : h(NIcon, {
                size: '40',
                depth: '3',
                component: UserAvatarIcon
              })
          )
      },
      {
        title: () => t('TEMP.Cabinet.PortfolioWeb.photoTypes'),
        key: 'photoTypes',
        width: 200,
        render: (row) => {
          const tags = (row?.photoTypes ?? []).map((type, index) =>
            h(
              NTag,
              {
                class: '!mr-2',
                type: ['default', 'warning', 'error', 'success', 'info'][index % 5],
                bordered: false
              },
              {
                default: () => type
              }
            )
          )
          return tags
        }
      },
      {
        title: () => t('TEMP.Cabinet.PortfolioWeb.createTime'),
        key: 'createTime',
        width: 80,
        titleAlign: 'center',
        align: 'center',
        render: (row) => (row.createTime ? TimeUtils.formatTime(row.createTime, 'YYYY/MM/DD') : '')
      }
    ]


    onMounted(() => queryList())

    return {
      columns,
      data: dataRef,
      checkArray,
      queryList,
      handleReset,
      ViewIcon,
      CogIcon,
      queryParams,
      FilterIcon,
      ReloadIcon,
      EditIcon,
      TrashBinOutline,
      ResetIcon,
      SearchIcon,
      FileExport,
      loading: loadingRef,
      t,
      portFolioFormModalRef,
      portFolioFormData,
      portFolioState,
      portFolioTypeModalRef,
      portFolioTypeFormData,
      AddSharp,
      dialog,
      pagination: paginationReactive,
      generalOptions,
      rowKey(rowData) {
        return rowData.folioId
      },
      handleCheck(rowKeys) {
        checkedRowKeysRef.value = rowKeys
      },
      showDropdown: showDropdownRef,
      createNewPortFolio() {
        portFolioState.value = 'create'
        portFolioFormData.value = {}
        portFolioFormModalRef.value.handleShowModal()
      },
      // editOnePortFolio() {
      //   if (checkedRowKeysRef.value.length === 0) {
      //     window.$message.warning(() => t('VALIDATION.ChooseOneDetail'))
      //   } else if (checkedRowKeysRef.value.length > 1) {
      //     window.$message.warning(() => t('VALIDATION.OnlyAllowOneDetail'))
      //   } else {
      //     portFolioState.value = 'edit'
      //     portFolioFormData.value = {}
      //     portFolioFormData.value = dataRef.value.filter(m => m.folioId === checkedRowKeysRef.value[0])[0]
      //     portFolioFormModalRef.value.handleShowModal()
      //   }
      // },
      deletePortFolios() {
        if (checkedRowKeysRef.value.length === 0) {
          window.$message.warning(() => t('VALIDATION.ChooseOneDetail'))
          return
        }

        const args = {ids: checkedRowKeysRef.value}
        dialog.warning({
          title: '警告',
          content: '确定要删掉这些图片吗',
          positiveText: '确定',
          negativeText: '取消',
          onPositiveClick: async () => {
            const {code, message} = await CabinetRelatedAPI.deletePortfolioWeb(args)
            if (code == '200') {
              queryList()
              checkArray.value = []
              window.$message.success(message)
            } else {
              window.$message.error(message)
            }

          },
          onNegativeClick: () => {
            window.$message.warning('取消操作')
          }
        })
      },
      editType() {
        portFolioTypeFormData.value = new Date()
        portFolioTypeModalRef.value.handleShowModal()
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
            <!--            <NInput-->
            <!--              v-model:value="queryParams.searchText"-->
            <!--              class="sm:!w-[180px]"-->
            <!--              clearable-->
            <!--              :placeholder="t('TEMP.Cabinet.Quotation.customerNameOrAddress')"-->
            <!--              @keydown.enter="queryList"-->
            <!--            >-->
            <!--              <template #prefix>-->
            <!--                <NIcon-->
            <!--                  :component="SearchIcon"-->
            <!--                  class="mr-1"-->
            <!--                />-->
            <!--              </template>-->
            <!--            </NInput>-->
            <!--              v-model:value="model.multipleSelectValue"-->
            <NSelect
              v-model:value="queryParams.searchText"
              :placeholder="t('TEMP.Cabinet.PortfolioWeb.typeYouWant')"
              class="sm:!w-[400px]"
              :options="generalOptions"
              multiple
              remote
            />

            <n-button icon-placement="left" secondary strong round @click="queryList">
              <template #icon>
                <n-icon>
                  <search-icon/>
                </n-icon>
              </template>
              {{ t('COMMON.Search') }}
            </n-button>

            <n-button icon-placement="left" secondary strong round @click="editType">
              <template #icon>
                <n-icon :component="CogIcon">
                  <!--                <AddSharp-icon />-->
                </n-icon>
              </template>
              {{ t('TEMP.Cabinet.PortfolioWeb.type') }}
            </n-button>


          </div>
        </div>

        <div class="flex w-full items-center justify-between space-x-3 sm:justify-end ">

          <n-button icon-placement="left" secondary strong @click="createNewPortFolio">
            <template #icon>
              <n-icon :component="AddSharp">
                <!--                <AddSharp-icon />-->
              </n-icon>
            </template>
            {{ t('COMMON.Create') }}
          </n-button>


<!--          <n-button icon-placement="left" secondary strong @click="editOnePortFolio">-->
<!--            <template #icon>-->
<!--              <n-icon :component="EditIcon">-->
<!--                &lt;!&ndash;                <AddSharp-icon />&ndash;&gt;-->
<!--              </n-icon>-->
<!--            </template>-->
<!--            {{ t('COMMON.Edit') }}-->
<!--          </n-button>-->


          <n-popover trigger="hover">
            <template #trigger>
              <n-button icon-placement="left" secondary strong @click="deletePortFolios">
                <template #icon>
                  <n-icon :component="TrashBinOutline">
                    <!--                <AddSharp-icon />-->
                  </n-icon>
                </template>
                {{ t('COMMON.DELETE') }}
              </n-button>
            </template>
            <span>干掉它们！😈</span>
          </n-popover>


          <NTooltip>
            <template #trigger>
              <NButton
                circle
                :disabled="loading"
                @click="handleReset"
              >
                <template #icon>
                  <NIcon :component="ResetIcon"/>
                </template>
              </NButton>
            </template>
            {{ t('COMMON.Reset') }}
          </NTooltip>

        </div>

      </div>
    </template>
    <!--如果是后端分页,这里一定要加上remote!-->
    <n-data-table
      v-model:checked-row-keys="checkArray"
      :row-key="rowKey"
      :remote="true"
      :columns="columns"
      :data="data"
      :cascade="false"
      :loading="loading"
      flex-height
      allow-checking-not-loaded
      :pagination="pagination"
      @update:page="() => queryList()"
      @update:checked-row-keys="handleCheck"
    />

    <PortFolioFormModal
      ref="portFolioFormModalRef"
      :port-folio-state="portFolioState"
      :port-folio-form-data="portFolioFormData"
      @save="queryList"
    />

    <PortFolioTypeModal
      ref="portFolioTypeModalRef"
      :port-folio-type-form-data="portFolioTypeFormData"
      @save="queryList"
    />
  </DataTableLayout>
</template>
