<script lang="ts">
import {AddSharp,Filter as FilterIcon, Reload as ReloadIcon, TrashBinOutline} from '@vicons/ionicons5'
import {NIcon, useDialog,useMessage} from 'naive-ui'

import {BasePageModel} from '@/constants'
import i18n from '@/i18n'
import type {Notice} from '@/types/api/notice'

import {QuotationFormModal} from './components'
import SearchIcon from '~icons/line-md/search'
import ResetIcon from '~icons/ic/round-refresh'
import EditIcon from '~icons/ic/sharp-edit'

const quotationFormModalRef = ref()
const quotationFormData = ref({})
const quotationState = ref('')
const dataRef = ref<Notice[]>([])
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
  searchText: ''
})


const queryList = () => {

  loadingRef.value = true

  const params = new BasePageModel({
    page: paginationReactive.page,
    pageSize: paginationReactive.pageSize,
    searchText: queryParams.searchText
  })

  CabinetRelatedAPI.list(params).then((result => {
    const {data, total} = result.data ?? {}

    dataRef.value = data.map(cabinetQuotation =>
      ({
        ...cabinetQuotation
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
components: {NIcon, QuotationFormModal, SearchIcon},
setup() {



  window.$message = useMessage()

  const dialog = useDialog()


  const columns: [{ disabled(row): boolean; type: string }, {
    width: number;
    title: string;
    key: string;
    ellipsis: boolean
  }, { width: number; title: () => any; key: string; ellipsis: boolean }, {
    width: number;
    title: () => any;
    key: string
  }, { width: number; title: () => any; key: string }, { width: number; title: () => any; key: string }, {
    width: number;
    title: () => any;
    align: string;
    render: (row) => string;
    key: string;
    titleAlign: string
  }, { width: number; title: () => any; key: string }] = [
    {
      type: 'selection',
      disabled (row) {
        return false
      }
    },
    {key: 'quotationId', title: 'ID', width: 30,ellipsis: true},
    {key: 'address', title: () => t('TEMP.Cabinet.Quotation.address'),width: 180,ellipsis: true},
    {key: 'customerName', title: () => t('TEMP.Cabinet.Quotation.customerName'),width: 50},
    {key: 'telephone', title: () => t('TEMP.Cabinet.Quotation.telephone'),width: 50},
    {key: 'productName', title: () => t('TEMP.Cabinet.Quotation.productName'),width: 50},
    {
      title: () => t('TEMP.Cabinet.Quotation.quotationDate'),
      key: 'quotationDate',
      width: 80,
      titleAlign: 'center',
      align: 'center',
      render: (row) => (row.quotationDate ? TimeUtils.formatTime(row.quotationDate, 'YYYY/MM/DD') : '')
    },
    {key: 'allTotalPrice', title: () => t('TEMP.Cabinet.Quotation.allTotalPrice'),width: 50}
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
    quotationFormModalRef,
    quotationFormData,
    quotationState,
    AddSharp,
    dialog,
    pagination: paginationReactive,
    rowKey (rowData) {
      return rowData.noticeId
    },
    handleCheck (rowKeys) {
      checkedRowKeysRef.value = rowKeys
    },
    showDropdown: showDropdownRef,
    createNewNotice(){
      quotationState.value = 'create'
      quotationFormData.value = {}
      quotationFormModalRef.value.handleShowModal()
    },
    editOneNotice(){
      if(checkedRowKeysRef.value.length === 0){
        window.$message.warning(()=>t('VALIDATION.ChooseOneDetail'))
      }else if(checkedRowKeysRef.value.length > 1){
        window.$message.warning(()=>t('VALIDATION.OnlyAllowOneDetail'))
      }else {
        quotationState.value = true
        quotationFormData.value = {}
        quotationFormData.value = dataRef.value.filter(m => m.noticeId === checkedRowKeysRef.value[0])[0]

        quotationFormModalRef.value.handleShowModal()
      }
    },
    deleteNotices(){
      if(checkedRowKeysRef.value.length === 0){
        window.$message.warning(()=>t('VALIDATION.ChooseOneDetail'))
        return
      }

      const args = {ids:checkedRowKeysRef.value}
      dialog.warning({
        title: '警告',
        content: "偷偷删掉,没看到此条通知的可能就看不到了",
        positiveText: '确定',
        negativeText: '取消',
        onPositiveClick: async () => {
          const {code, message} = await NoticeAPI.delete(args)
          if(code == '200'){
            queryList()
            checkArray.value = []
            console.log(checkedRowKeysRef.value)
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
              class="sm:!w-[180px]"
              clearable
              :placeholder="t('TEMP.Cabinet.Quotation.customerNameOrAddress')"
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

          <n-button icon-placement="left" secondary strong @click="createNewNotice">
            <template #icon>
              <n-icon :component="AddSharp">
                <!--                <AddSharp-icon />-->
              </n-icon>
            </template>
            {{ t('COMMON.Create') }}
          </n-button>


          <n-button icon-placement="left" secondary strong @click="editOneNotice">
            <template #icon>
              <n-icon :component="EditIcon">
                <!--                <AddSharp-icon />-->
              </n-icon>
            </template>
            {{ t('COMMON.Edit') }}
          </n-button>


          <n-popover trigger="hover">
            <template #trigger>
              <n-button icon-placement="left" secondary strong @click="deleteNotices">
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

    <QuotationFormModal
      ref="quotationFormModalRef"
      :quotation-state="quotationState"
      :quotation-form-data="quotationFormData"
      @save="queryList"
    />
  </DataTableLayout>
</template>