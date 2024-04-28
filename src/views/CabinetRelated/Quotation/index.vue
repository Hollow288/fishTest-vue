<script lang="ts">
import {AddSharp, Filter as FilterIcon, Reload as ReloadIcon, TrashBinOutline, CartOutline} from '@vicons/ionicons5'
import {NIcon, useDialog, useMessage} from 'naive-ui'

import {CabinetRelatedAPI} from '@/api/cabinetRelated'
import {BasePageModel} from '@/constants'
import i18n from '@/i18n'
import type {CabinetQuotation} from '@/types/api/cabinetQuotation'
import ResetIcon from '~icons/ic/round-refresh'
import EditIcon from '~icons/ic/sharp-edit'
import SearchIcon from '~icons/line-md/search'
import ViewIcon from '~icons/mdi/file-search-outline'
import FileExport from '~icons/tabler/FileExport'

import {QuotationFormModal} from './components'

const quotationFormModalRef = ref()
const quotationFormData = ref({})
const quotationState = ref('')
const dataRef = ref<CabinetQuotation[]>([])
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

  CabinetRelatedAPI.listQuotation(params).then((result => {
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


    const messages = useMessage()

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
        disabled(row) {
          return false
        }
      },
      {key: 'quotationId', title: 'ID', width: 30, ellipsis: true},
      {key: 'address', title: () => t('TEMP.Cabinet.Quotation.address'), width: 180, ellipsis: true},
      {key: 'customerName', title: () => t('TEMP.Cabinet.Quotation.customerName'), width: 50},
      {key: 'telephone', title: () => t('TEMP.Cabinet.Quotation.telephone'), width: 50},
      {key: 'productName', title: () => t('TEMP.Cabinet.Quotation.productName'), width: 50},
      {
        title: () => t('TEMP.Cabinet.Quotation.quotationDate'),
        key: 'quotationDate',
        width: 80,
        titleAlign: 'center',
        align: 'center',
        render: (row) => (row.quotationDate ? TimeUtils.formatTime(row.quotationDate, 'YYYY/MM/DD') : '')
      },
      {key: 'allTotalPrice', title: () => t('TEMP.Cabinet.Quotation.allTotalPrice'), width: 50}
    ]


    onMounted(() => queryList())

    return {
      columns,
      data: dataRef,
      checkArray,
      queryList,
      handleReset,
      ViewIcon,
      queryParams,
      FilterIcon,
      ReloadIcon,
      EditIcon,
      TrashBinOutline,
      CartOutline,
      ResetIcon,
      SearchIcon,
      FileExport,
      loading: loadingRef,
      t,
      quotationFormModalRef,
      quotationFormData,
      quotationState,
      AddSharp,
      dialog,
      pagination: paginationReactive,
      rowKey(rowData) {
        return rowData.quotationId
      },
      handleCheck(rowKeys) {
        checkedRowKeysRef.value = rowKeys
      },
      showDropdown: showDropdownRef,
      createNewQuotation() {
        quotationState.value = 'create'
        quotationFormData.value = {}
        quotationFormModalRef.value.handleShowModal()
      },
      editOneQuotation() {
        if (checkedRowKeysRef.value.length === 0) {
          messages.warning(() => t('VALIDATION.ChooseOneDetail'))
        } else if (checkedRowKeysRef.value.length > 1) {
          messages.warning(() => t('VALIDATION.OnlyAllowOneDetail'))
        } else {
          quotationState.value = 'edit'
          quotationFormData.value = {}
          quotationFormData.value = dataRef.value.filter(m => m.quotationId === checkedRowKeysRef.value[0])[0]
          quotationFormModalRef.value.handleShowModal()
        }
      },
      viewOneQuotation() {
        if (checkedRowKeysRef.value.length === 0) {
          messages.warning(() => t('VALIDATION.ChooseOneDetail'))
        } else if (checkedRowKeysRef.value.length > 1) {
          messages.warning(() => t('VALIDATION.OnlyAllowOneDetail'))
        } else {
          quotationState.value = 'view'
          quotationFormData.value = {}
          quotationFormData.value = dataRef.value.filter(m => m.quotationId === checkedRowKeysRef.value[0])[0]
          quotationFormModalRef.value.handleShowModal()
        }
      },
      deleteQuotations() {
        if (checkedRowKeysRef.value.length === 0) {
          messages.warning(() => t('VALIDATION.ChooseOneDetail'))
          return
        }

        const args = {ids: checkedRowKeysRef.value}
        dialog.warning({
          title: '警告',
          content: '确定要删掉这些报价单吗',
          positiveText: '确定',
          negativeText: '取消',
          onPositiveClick: async () => {
            const {code, message} = await CabinetRelatedAPI.deleteQuotations(args)
            if (code == '200') {
              queryList()
              checkArray.value = []
              messages.success(message)
            } else {
              messages.error(message)
            }

          },
          onNegativeClick: () => {
            messages.warning('取消操作')
          }
        })
      },
      handleExport(){
      if (checkedRowKeysRef.value.length === 0) {
        messages.warning(() => t('VALIDATION.ChooseOneDetail'))
      } else if (checkedRowKeysRef.value.length > 1) {
        messages.warning(() => t('VALIDATION.OnlyAllowOneDetail'))
      }else{
        const temObj  = dataRef.value.filter(m => m.quotationId === checkedRowKeysRef.value[0])[0]
        ExportAPI.getExportQuotation(temObj.quotationId).then(result => {

          const blob = new Blob([result], {type: 'application/octet-stream'})
          // 创建一个临时 URL
          const url = window.URL.createObjectURL(blob)
          // 创建一个下载链接
          const a = document.createElement('a')
          a.href = url
          a.download = `${temObj.address}-报价单.docx` // 设置下载的文件名
          a.target = '_blank'
          // 触发点击事件，开始下载
          document.body.appendChild(a)
          a.click()
          // 清理临时 URL
          window.URL.revokeObjectURL(url)
          messages.success(`导出成功：${temObj.address}-报价单.docx`)
        })
      }
      },
      handleExportPdf(){
        if (checkedRowKeysRef.value.length === 0) {
          messages.warning(() => t('VALIDATION.ChooseOneDetail'))
        } else if (checkedRowKeysRef.value.length > 1) {
          messages.warning(() => t('VALIDATION.OnlyAllowOneDetail'))
        }else{
          const temObj  = dataRef.value.filter(m => m.quotationId === checkedRowKeysRef.value[0])[0]
          ExportAPI.getExportQuotationPdf(temObj.quotationId).then(result => {

            const blob = new Blob([result], {type: 'application/octet-stream'})
            // 创建一个临时 URL
            const url = window.URL.createObjectURL(blob)
            // 创建一个下载链接
            const a = document.createElement('a')
            a.href = url
            a.download = `${temObj.address}-报价单.pdf` // 设置下载的文件名
            a.target = '_blank'
            // 触发点击事件，开始下载
            document.body.appendChild(a)
            a.click()
            // 清理临时 URL
            window.URL.revokeObjectURL(url)
            messages.success(`导出成功：${temObj.address}-报价单.pdf`)
          })
        }
      },
      rowProps: (row: CabinetQuotation) => ({
        style: 'cursor: pointer;',
        onDblclick: () => {
          quotationState.value = 'view'
          quotationFormData.value = row
          quotationFormModalRef.value.handleShowModal()
        }
      }),
      autoOrderStatus(){
        if (checkedRowKeysRef.value.length === 0) {
          messages.warning(() => t('VALIDATION.ChooseOneDetail'))
        } else if (checkedRowKeysRef.value.length > 1) {
          messages.warning(() => t('VALIDATION.OnlyAllowOneDetail'))
        } else {
          const quotationId = {id: checkedRowKeysRef.value[0]}
          CabinetRelatedAPI.autoOrderStatus(quotationId).then(result=>{
            if(result.code == 200){
              if(result.message === '该报价单已经生成订单状态'){
                messages.warning(result.message)
              }else{
                messages.success(result.message)
              }
            }else{
              messages.warning(result.message)
            }
          })
        }
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

            <n-button icon-placement="left" secondary strong round @click="queryList">
              <template #icon>
                <n-icon>
                  <search-icon/>
                </n-icon>
              </template>
              {{ t('COMMON.Search') }}
            </n-button>


          </div>
        </div>

        <div class="flex w-full items-center justify-between space-x-3 sm:justify-end ">

          <n-button icon-placement="left" secondary strong @click="createNewQuotation">
            <template #icon>
              <n-icon :component="AddSharp">
                <!--                <AddSharp-icon />-->
              </n-icon>
            </template>
            {{ t('COMMON.Create') }}
          </n-button>


          <n-button icon-placement="left" secondary strong @click="editOneQuotation">
            <template #icon>
              <n-icon :component="EditIcon">
                <!--                <AddSharp-icon />-->
              </n-icon>
            </template>
            {{ t('COMMON.Edit') }}
          </n-button>


          <n-button icon-placement="left" secondary strong @click="viewOneQuotation">
            <template #icon>
              <n-icon :component="ViewIcon">
                <!--                <AddSharp-icon />-->
              </n-icon>
            </template>
            {{ t('TEMP.Cabinet.Quotation.view') }}
          </n-button>


          <n-popover trigger="hover">
            <template #trigger>
              <n-button icon-placement="left" secondary strong @click="deleteQuotations">
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

          <n-button icon-placement="left" secondary strong @click="handleExport">
            <template #icon>
              <n-icon :component="FileExport">
                <!--                <AddSharp-icon />-->
              </n-icon>
            </template>
            {{ t('TEMP.Cabinet.Quotation.export') }}
          </n-button>

<!--&lt;!&ndash;           Todo 导出PDF&ndash;&gt;-->
<!--          <n-button icon-placement="left" secondary strong @click="handleExportPdf">-->
<!--            <template #icon>-->
<!--              <n-icon :component="FileExport">-->
<!--                &lt;!&ndash;                <AddSharp-icon />&ndash;&gt;-->
<!--              </n-icon>-->
<!--            </template>-->
<!--&lt;!&ndash;            {{ t('TEMP.Cabinet.Quotation.export') }}&ndash;&gt;pdf-->
<!--          </n-button>-->


          <n-button icon-placement="left" secondary strong @click="autoOrderStatus">
            <template #icon>
              <n-icon :component="CartOutline">
                <!--                <AddSharp-icon />-->
              </n-icon>
            </template>
            {{ t('TEMP.Cabinet.Quotation.autoOrderStatus') }}
          </n-button>


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
      :row-props="rowProps"
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

    <QuotationFormModal
      ref="quotationFormModalRef"
      :quotation-state="quotationState"
      :quotation-form-data="quotationFormData"
      @save="queryList"
    />
  </DataTableLayout>
</template>
