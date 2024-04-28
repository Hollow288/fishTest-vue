<script lang="ts">
import {AddSharp,Filter as FilterIcon, Reload as ReloadIcon, TrashBinOutline} from '@vicons/ionicons5'
import {NIcon, useDialog,useMessage} from 'naive-ui'
import type {RowData} from 'naive-ui/es/data-table/src/interface'

import {BasePageModel} from '@/constants'
import i18n from '@/i18n'
import type {OrderStatus} from '@/types/api/orderStatus'
import ResetIcon from '~icons/ic/round-refresh'
import EditIcon from '~icons/ic/sharp-edit'
import SearchIcon from '~icons/line-md/search'

import {OrderFormModal} from './components'

const orderFormModalRef = ref()
const orderFormData = ref({})
const isOrderEdit = ref('')
const dataRef = ref<OrderStatus[]>([])
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

  CabinetRelatedAPI.listOrderStatus(params).then((result => {
    const {data, total} = result.data ?? {}

    dataRef.value = data.map(orderStatus =>
      ({
        ...orderStatus
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
  components: {NIcon, OrderFormModal, SearchIcon},
  setup() {

    const messages = useMessage()

    const dialog = useDialog()


    const columns: [{ disabled(row): boolean; type: string }, {
      width: number;
      title: string;
      key: string;
      ellipsis: boolean
    }, { width: number; title: () => any; key: string }, {
      width: number;
      title: () => any;
      key: string;
      ellipsis: boolean
    }, { width: number; title: () => any; key: string }, { width: number; title: () => any; key: string }, {
      width: number;
      title: () => any;
      key: string
    }, { width: number; title: () => any; key: string }, { width: number; title: () => any; key: string }, {
      width: number;
      title: () => any;
      key: string;
      ellipsis: boolean
    }, { width: number; title: () => any; align: string; render: (row) => string; key: string; titleAlign: string }] = [
      {
        type: 'selection',
        disabled (row) {
          return false
        }
      },
      {key: 'orderId', title: 'ID', width: 50,ellipsis: true},
      {key: 'customerName', title: () => t('TEMP.Cabinet.OrderStatus.customerName'),width:80},
      {key: 'address', title: () => t('TEMP.Cabinet.OrderStatus.address'),width: 200,ellipsis: true},
      {key: 'telephone', title: () => t('TEMP.Cabinet.OrderStatus.telephone'),width: 100},
      {key: 'productName', title: () => t('TEMP.Cabinet.OrderStatus.productName'),width: 120},
      {key: 'allTotalPrice', title: () => t('TEMP.Cabinet.OrderStatus.allTotalPrice'),width: 120},
      {key: 'paidPrice', title: () => t('TEMP.Cabinet.OrderStatus.paidPrice'),width: 120},
      {key: 'unPaidPrice', title: () => t('TEMP.Cabinet.OrderStatus.unPaidPrice'),width: 120},
      {key: 'remark', title: () => t('TEMP.Cabinet.OrderStatus.remark'),width: 200,ellipsis: true},
      {
        title: () => t('TEMP.Cabinet.OrderStatus.createTime'),
        key: 'createTime',
        width: 100,
        titleAlign: 'center',
        align: 'center',
        render: (row) => (row.createTime ? TimeUtils.formatTime(row.createTime, 'YYYY/MM/DD') : '')
      },
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
      orderFormModalRef,
      orderFormData,
      isOrderEdit,
      AddSharp,
      dialog,
      pagination: paginationReactive,
      rowKey (rowData) {
        return rowData.orderId
      },
      rowClassName (row: RowData) {
        if(row.unPaidPrice === 0 ){
          return 'paid'
        }
          return 'no-paid'
      },
      handleCheck (rowKeys) {
        checkedRowKeysRef.value = rowKeys
      },
      showDropdown: showDropdownRef,
      createNewOrder(){
        isOrderEdit.value = 'create'
        orderFormData.value = {}
        orderFormModalRef.value.handleShowModal()
      },
      editOneOrder(){
        if(checkedRowKeysRef.value.length === 0){
          messages.warning(()=>t('VALIDATION.ChooseOneDetail'))
        }else if(checkedRowKeysRef.value.length > 1){
          messages.warning(()=>t('VALIDATION.OnlyAllowOneDetail'))
        }else {
          isOrderEdit.value = 'edit'
          orderFormData.value = {}
          orderFormData.value = dataRef.value.filter(m => m.orderId === checkedRowKeysRef.value[0])[0]
          orderFormModalRef.value.handleShowModal()
        }
      },
      deleteOrders(){
        if(checkedRowKeysRef.value.length === 0){
          messages.warning(()=>t('VALIDATION.ChooseOneDetail'))
          return
        }

        const args = {ids:checkedRowKeysRef.value}
        dialog.warning({
          title: '警告',
          content: '偷偷删掉,没看到此条通知的可能就看不到了',
          positiveText: '确定',
          negativeText: '取消',
          onPositiveClick: async () => {
            const {code, message} = await OrderAPI.delete(args)
            if(code == '200'){
              queryList()
              checkArray.value = []
              console.log(checkedRowKeysRef.value)
              messages.success(message)
            }else{
              messages.error(message)
            }

          },
          onNegativeClick: () => {
            messages.warning('取消操作')
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
              class="sm:!w-[300px]"
              clearable
              :placeholder="t('TEMP.Cabinet.OrderStatus.addressAndName')"
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

          <n-button icon-placement="left" secondary strong @click="createNewOrder">
            <template #icon>
              <n-icon :component="AddSharp">
                <!--                <AddSharp-icon />-->
              </n-icon>
            </template>
            {{ t('COMMON.Create') }}
          </n-button>


          <n-button icon-placement="left" secondary strong @click="editOneOrder">
            <template #icon>
              <n-icon :component="EditIcon">
                <!--                <AddSharp-icon />-->
              </n-icon>
            </template>
            {{ t('COMMON.Edit') }}
          </n-button>


          <n-popover trigger="hover">
            <template #trigger>
              <n-button icon-placement="left" secondary strong @click="deleteOrders">
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
      :scroll-x="1500"
      :row-key="rowKey"
      :remote = "true"
      :columns="columns"
      :data="data"
      :row-class-name="rowClassName"
      :cascade="false"
      :loading="loading"
      flex-height
      allow-checking-not-loaded
      :pagination="pagination"
      @update:page="() => queryList()"
      @update:checked-row-keys="handleCheck"
    />

    <OrderFormModal
      ref="orderFormModalRef"
      :is-edit="isOrderEdit"
      :order-form-data="orderFormData"
      @save="queryList"
    />
  </DataTableLayout>
</template>

<style scoped>
:deep(.no-paid td) {
  //color: rgba(255, 0, 0, 0.75) !important;
  background-color: rgba(251, 238, 241, 1) !important;
}

:deep(.paid td) {
  background-color: rgba(237, 247, 242, 1) !important;
}

</style>
