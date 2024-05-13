<script lang="ts">
import {AddSharp,Filter as FilterIcon, Reload as ReloadIcon, TrashBinOutline} from '@vicons/ionicons5'
import {NIcon, useDialog,useMessage} from 'naive-ui'

import {CabinetRelatedAPI} from '@/api/cabinetRelated'
import {BasePageModel} from '@/constants'
import i18n from '@/i18n'
import type {NewsInformation} from '@/types/api/newsInformation'
import ResetIcon from '~icons/ic/round-refresh'
import EditIcon from '~icons/ic/sharp-edit'
import SearchIcon from '~icons/line-md/search'
import ImageOutlineIcon from '~icons/mdi/image-remove-outline'

import {NewsInformationFormModal} from './components'





const newsInformationFormModalRef = ref()
const newsInformationFormData = ref({})
const isNewsInformationEdit = ref(true)
const dataRef = ref<NewsInformation[]>([])
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
    queryList()
  },
  onUpdatePageSize: (pageSize: number) => {
    paginationReactive.pageSize = pageSize
    paginationReactive.page = 1
    queryList()
  },
  prefix: (info) => t('COMMON.TotalPage', {totalPage: info.itemCount})
})


const queryParams = reactive({
  searchText: ''
})


const queryList = () => {

  loadingRef.value = true

  const params = new BasePageModel({
    page: paginationReactive.page,
    pageSize: paginationReactive.pageSize,
    searchText: queryParams.searchText
  })

  CabinetRelatedAPI.newsInformationList(params).then((result => {
    const {data, total} = result.data ?? {}

    dataRef.value = data.map(newsInformation =>
      ({
        ...newsInformation
      })
    )
    paginationReactive.itemCount = total
    loadingRef.value = false
  }))
}


const handleReset = () => {
  queryParams.searchText = ''
  paginationReactive.page = 1
  paginationReactive.pageSize = 10
  paginationReactive.itemCount = 0
  queryList()
}



  export default defineComponent({
  components: {NIcon, NewsInformationFormModal, SearchIcon},
  setup() {



    window.$message = useMessage()

    const dialog = useDialog()


    const columns: [{ disabled(row): boolean; type: string }, {
      width: number;
      title: string;
      key: string;
      ellipsis: boolean
    }, { width: number; title: () => any; key: string; ellipsis: { tooltip: boolean } }, {
      width: number;
      title: () => any;
      key: string;
      ellipsis: { tooltip: boolean }
    }, {
      width: number;
      title: () => any;
      align: string;
      render: (row) => VNode<RendererNode, RendererElement, { [p: string]: any }>;
      key: string;
      titleAlign: string
    }, { width: number; title: () => any; align: string; render: (row) => string; key: string; titleAlign: string }] = [
      {
        type: 'selection',
        disabled (row) {
          return false
        }
      },
      {key: 'newsId', title: 'ID', width: 30,ellipsis: true},
      {key: 'newsTitle', title: () => t('TEMP.Cabinet.NewsInformation.newsTitle'),width: 50, ellipsis: {tooltip: true}},
      {key: 'newsIntroduction', title: () => t('TEMP.Cabinet.NewsInformation.newsIntroduction'),width: 200, ellipsis: {tooltip: true}},
      {
        title: () => t('TEMP.Cabinet.NewsInformation.newsCover'),
        key: 'newsCover',
        width: 55,
        titleAlign: 'center',
        align: 'center',
        render: (row) =>
          h(
            'div',
            {
              class: 'flex align-center justify-center'
            },
            row.newsCover
              ? h(NImage, {
                src: row.newsCover,
                lazy: true,
                class: 'my-1',
                width:'100'
              })
              : h(NIcon, {
                size: '40',
                depth: '3',
                component: ImageOutlineIcon
              })
          )
      },
      {
        title: () => t('TEMP.Cabinet.NewsInformation.newsDate'),
        key: 'newsDate',
        width: 80,
        titleAlign: 'center',
        align: 'center',
        render: (row) => (row.newsDate ? TimeUtils.formatTime(row.newsDate, 'YYYY/MM/DD') : '')
      }
    ]


    onMounted(() => queryList())

    return {
      columns,
      data: dataRef,
      checkArray,
      queryList,
      handleReset,
      queryParams,
      FilterIcon,
      ReloadIcon,
      EditIcon,
      TrashBinOutline,
      ResetIcon,
      SearchIcon,
      loading: loadingRef,
      t,
      newsInformationFormModalRef,
      newsInformationFormData,
      isNewsInformationEdit,
      AddSharp,
      dialog,
      pagination: paginationReactive,
      rowKey (rowData) {
        return rowData.newsId
      },
      handleCheck (rowKeys) {
        checkedRowKeysRef.value = rowKeys
      },
      showDropdown: showDropdownRef,
      createNewsInformation(){
        isNewsInformationEdit.value = false
        newsInformationFormData.value = {}
        newsInformationFormModalRef.value.handleShowModal()
      },
      editNewsInformation(){
        if(checkedRowKeysRef.value.length === 0){
          window.$message.warning(()=>t('VALIDATION.ChooseOneDetail'))
        }else if(checkedRowKeysRef.value.length > 1){
          window.$message.warning(()=>t('VALIDATION.OnlyAllowOneDetail'))
        }else {
          isNewsInformationEdit.value = true
          newsInformationFormData.value = {}
          newsInformationFormData.value = dataRef.value.filter(m => m.newsId === checkedRowKeysRef.value[0])[0]
          newsInformationFormModalRef.value.handleShowModal()
        }
      },
      deleteNewsInformation(){
        if(checkedRowKeysRef.value.length === 0){
          window.$message.warning(()=>t('VALIDATION.ChooseOneDetail'))
          return
        }
        const args = {ids:checkedRowKeysRef.value}
        dialog.warning({
          title: '警告',
          content: '确定要删除这条新闻资讯吗？',
          positiveText: '确定',
          negativeText: '取消',
          onPositiveClick: async () => {
            const {code, message} = await CabinetRelatedAPI.deleteNewsInformation(args)
            if(code == '200'){
              queryList()
              checkArray.value = []
              window.$message.success(message)
            }else{
              window.$message.error(message)
            }

          },
          onNegativeClick: () => {
            window.$message.warning('取消操作')
          }
        })
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
            <NInput
              v-model:value="queryParams.searchText"
              class="sm:!w-[150px]"
              clearable
              :placeholder="t('TEMP.Cabinet.NewsInformation.newsTitle')"
              @keydown.enter="queryList"
            >
              <template #prefix>
                <NIcon
                  :component="SearchIcon"
                  class="mr-1"
                />
              </template>
            </NInput>

            <n-button icon-placement="left" secondary strong round   @click="queryList">
              <template #icon>
                <n-icon>
                  <search-icon />
                </n-icon>
              </template>
              {{ t('COMMON.Search') }}
            </n-button>


          </div>
        </div>

        <div class="flex w-full items-center justify-between space-x-3 sm:justify-end ">

          <n-button icon-placement="left" secondary strong @click="createNewsInformation">
            <template #icon>
              <n-icon :component="AddSharp">
                <!--                <AddSharp-icon />-->
              </n-icon>
            </template>
            {{ t('COMMON.Create') }}
          </n-button>


          <n-button icon-placement="left" secondary strong @click="editNewsInformation">
            <template #icon>
              <n-icon :component="EditIcon">
                <!--                <AddSharp-icon />-->
              </n-icon>
            </template>
            {{ t('COMMON.Edit') }}
          </n-button>


          <n-popover trigger="hover">
            <template #trigger>
              <n-button icon-placement="left" secondary strong @click="deleteNewsInformation">
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
                  <NIcon :component="ResetIcon" />
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
      :remote = "true"
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

    <NewsInformationFormModal
      ref="newsInformationFormModalRef"
      :is-edit="isNewsInformationEdit"
      :news-information-form-data="newsInformationFormData"
      @save="queryList"
    />
  </DataTableLayout>
</template>

<style>
.n-image-preview-toolbar {
  z-index: 1;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  border-radius: var(--n-toolbar-border-radius);
  height: 48px;
  bottom: 40px;
  padding: 0 12px;
  background: var(--n-toolbar-color);
  box-shadow: var(--n-toolbar-box-shadow);
  color: var(--n-toolbar-icon-color);
  transition: color .3s var(--n-bezier);
  display: flex;
  gap: 20px;
  align-items: center;
}
</style>
