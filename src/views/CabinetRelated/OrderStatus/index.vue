<script lang="ts">
import {AddSharp,Filter as FilterIcon, Reload as ReloadIcon, TrashBinOutline} from '@vicons/ionicons5'
import {FormInst, FormValidationError, NIcon, useDialog, useMessage} from 'naive-ui'
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
const checkData = ref({thisPaidPrice:0})
const temId = ref('')
const temAllPrice = ref(0)
const temPaidPrice = ref(0)
const temNoPaidPrice = ref(0)
const thisPaidPrice = ref(0)
const temCustomerName = ref('')




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
    const showModal = ref(false)
    const [submitLoading, submitLoadingDispatcher] = useLoading()
    const formRef = ref<FormInst | null>(null)

    const checkSubmit = async () => {
      if(checkData.value.thisPaidPrice === 0){
        messages.success('操作成功')
        showModal.value = false
        return true
      }
        try {
          await formRef.value!.validate()
        } catch (errors) {
          const errorMessage = (errors as FormValidationError[])[0][0].message
          if (errorMessage) {
            messages.error(errorMessage)
          }
          return false
        }

        if (submitLoading.value) {
          return true
        }
        submitLoadingDispatcher.loading()

        try {
          CabinetRelatedAPI.addArrivedPrice(checkData.value, temId.value).then(result => {
            if (result.code == 200) {
              messages.success(result.message!)
              showModal.value = false
              queryList()
            } else {
              messages.error(result.message!)
            }
          })
        } catch (err: any) {
          if (err.message) {
            messages.error(err.message)
          }
        }
        submitLoadingDispatcher.loaded()
        return true
    }

    const columns: [{ disabled(row): boolean; type: string }, {
      width: number;
      title: string;
      key: string;
      ellipsis: boolean
    }, { width: number; title: () => any; key: string }, {
      width: number;
      title: () => any;
      key: string;
      ellipsis: { tooltip: boolean }
    }, { width: number; title: () => any; key: string }, { width: number; title: () => any; key: string }, {
      width: number;
      title: () => any;
      key: string
    }, { width: number; title: () => any; key: string }, { width: number; title: () => any; key: string }, {
      width: number;
      title: () => any;
      key: string;
      ellipsis: { tooltip: boolean }
    }, { width: number; title: () => any; align: string; render: (row) => string; key: string; titleAlign: string }, {
      width: number;
      fixed: string;
      title: () => any;
      align: string;
      render: (row) => VNode<RendererNode, RendererElement, { [p: string]: any }>;
      key: string;
      titleAlign: string
    }] = [
      {
        type: 'selection',
        disabled (row) {
          return false
        }
      },
      {key: 'orderId', title: 'ID', width: 50,ellipsis: true},
      {key: 'customerName', title: () => t('TEMP.Cabinet.OrderStatus.customerName'),width:80},
      {key: 'address', title: () => t('TEMP.Cabinet.OrderStatus.address'),width: 200,ellipsis: {tooltip: true}},
      {key: 'telephone', title: () => t('TEMP.Cabinet.OrderStatus.telephone'),width: 100},
      {key: 'productName', title: () => t('TEMP.Cabinet.OrderStatus.productName'),width: 120},
      {key: 'allTotalPrice', title: () => t('TEMP.Cabinet.OrderStatus.allTotalPrice'),width: 120},
      {key: 'paidPrice', title: () => t('TEMP.Cabinet.OrderStatus.paidPrice'),width: 120},
      {key: 'unPaidPrice', title: () => t('TEMP.Cabinet.OrderStatus.unPaidPrice'),width: 120},
      {key: 'remark', title: () => t('TEMP.Cabinet.OrderStatus.remark'),width: 200,ellipsis: {tooltip: true}},
      {
        title: () => t('TEMP.Cabinet.OrderStatus.createTime'),
        key: 'createTime',
        width: 100,
        titleAlign: 'center',
        align: 'center',
        render: (row) => (row.createTime ? TimeUtils.formatTime(row.createTime, 'YYYY/MM/DD') : '')
      },
      {
        title: () => t('COMMON.Operation'),
        key: 'operation',
        width: 180,
        titleAlign: 'center',
        align: 'center',
        fixed: 'right',
        render: (row) =>
          h(
            'div',
            {
              class: 'space-x-3 flex justify-center'
            },
            [
              h(
                NButton,
                {
                  type: 'default',
                  size: 'small',
                  onClick: () => {
                    if(row.unPaidPrice === 0){
                      messages.warning('该订单已经全部付款')
                      return
                    }
                    temId.value = row.orderId
                    checkData.value.thisPaidPrice = 0
                    temAllPrice.value = row.allTotalPrice
                    temPaidPrice.value = row.paidPrice
                    temNoPaidPrice.value = row.unPaidPrice
                    temCustomerName.value = row.customerName
                    showModal.value = true
                  }
                },
                {
                  default: () => t('TEMP.Cabinet.OrderStatus.ReceiptRegistration')
                }
              )
            ]
          )
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
      checkData,
      orderFormModalRef,
      orderFormData,
      isOrderEdit,
      AddSharp,
      dialog,
      showModal,
      temAllPrice,
      temPaidPrice,
      temNoPaidPrice,
      thisPaidPrice,
      temCustomerName,
      checkSubmit,
      formRef,
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
      rowProps: (row: OrderStatus) => ({
        style: 'cursor: pointer;',
        onDblclick: () => {
          isOrderEdit.value = 'view'
          orderFormData.value = row
          orderFormModalRef.value.handleShowModal()
        }
      }),
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
          content: '确定要删掉这些订单状态吗',
          positiveText: '确定',
          negativeText: '取消',
          onPositiveClick: async () => {
            const {code, message} = await CabinetRelatedAPI.deleteOrderStatusByIds(args)
            if(code == '200'){
              queryList()
              checkArray.value = []
              messages.success(message)
            }else{
              messages.error(message)
            }

          },
          onNegativeClick: () => {
            messages.warning('取消操作')
          }
        })
      },
      parse(input: string){
        const nums = input.replace(/,/g, '').trim()
        if (/^\d+(\.(\d+)?)?$/.test(nums)) return Number(nums)
        return nums === '' ? null : Number.NaN
      },
      format(value: number | null){
        if (value === null) {
          return ''
        }
        return value.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      },
      checkRules: {
        thisPaidPrice: {
            required: true,
            validator: (rule, value, callback) => {
              if (typeof value === 'undefined'  || value === null || value === '') {
                callback(new Error(t('TEMP.Validation.thisPaidPrice')))
                return
              }
              if (value > temNoPaidPrice.value){
                callback(new Error(t('TEMP.Validation.noBigNegative')))
                return
              }
              if (value < 0) {
                callback(new Error(t('TEMP.Validation.amountNegative')))
                return
              }
              callback()
            },
            trigger: ['blur', 'input']
        }
      },
      checkCancel(){
        showModal.value = false
        messages.warning('取消操作')
      },

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
      :row-props="rowProps"
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


    <n-modal v-model:show="showModal" preset="dialog" title="Dialog" class="!my-6 sm:!w-[800px]">
      <template #header>
        <div>收款登记</div>
      </template>
      <div>
        <NForm
          label-placement="left"
          :rules="checkRules"
          :model="checkData"
          ref="formRef"
        >
          <nGrid :cols="24" x-gap="12">
            <NFormItemGi
              :span="16"
              path="temCustomerName"
              :label="t('TEMP.Cabinet.OrderStatus.customerName')"
            >
              <NInput
                v-model:value="temCustomerName"
                :placeholder="t('TEMP.Cabinet.OrderStatus.customerName')"
                readonly
              />
            </NFormItemGi>
            <NFormItemGi
              :span="8"
              path="temAllPrice"
              :label="t('TEMP.Cabinet.OrderStatus.allTotalPrice')"
            >
              <nInputNumber
                v-model:value="temAllPrice"
                :placeholder="t('TEMP.Cabinet.OrderStatus.unPaidPrice')"
                type="number"
                show-count
                readonly
                :parse="parse"
                :format="format"
                :show-button="false"
                style="width: 100%"
              >
                <template #suffix>
                  元
                </template>
              </nInputNumber>
            </NFormItemGi>
          </nGrid>

          <nGrid :cols="24" x-gap="12">
            <NFormItemGi
              :span="8"
              path="temPaidPrice"
              :label="t('TEMP.Cabinet.OrderStatus.paidPrice')"
            >
              <nInputNumber
                v-model:value="temPaidPrice"
                :placeholder="t('TEMP.Cabinet.OrderStatus.paidPrice')"
                type="number"
                show-count
                readonly
                :parse="parse"
                :format="format"
                :show-button="false"
                style="width: 100%"
              >
                <template #suffix>
                  元
                </template>
              </nInputNumber>
            </NFormItemGi>
            <NFormItemGi
              :span="8"
              path="temNoPaidPrice"
              :label="t('TEMP.Cabinet.OrderStatus.unPaidPrice')"
            >
              <nInputNumber
                v-model:value="temNoPaidPrice"
                :placeholder="t('TEMP.Cabinet.OrderStatus.unPaidPrice')"
                type="number"
                show-count
                readonly
                :parse="parse"
                :format="format"
                :show-button="false"
                style="width: 100%"
              >
                <template #suffix>
                  元
                </template>
              </nInputNumber>
            </NFormItemGi>
            <NFormItemGi
              :span="8"
              path="thisPaidPrice"
              :label="t('TEMP.Cabinet.OrderStatus.thisPaidPrice')"
            >
              <nInputNumber
                v-model:value="checkData.thisPaidPrice"
                :placeholder="t('TEMP.Cabinet.OrderStatus.thisPaidPrice')"
                type="number"
                show-count
                clearable
                :parse="parse"
                :format="format"
                :show-button="false"
                style="width: 100%"
              >
                <template #suffix>
                  元
                </template>
              </nInputNumber>
            </NFormItemGi>
          </nGrid>

        </NForm>
      </div>
      <template #action>
        <div class="flex justify-center space-x-3">
          <NButton type="default" size="small" @click="checkCancel">
            取消
          </NButton>
          <NButton type="info" size="small" @click="checkSubmit">
            保存
          </NButton>
        </div>
      </template>
    </n-modal>
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
