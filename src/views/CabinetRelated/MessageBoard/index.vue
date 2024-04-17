<script lang="ts">
import { Reload as ReloadIcon, TrashBinOutline} from '@vicons/ionicons5'
import {NIcon, useDialog,useMessage} from 'naive-ui'

import {CabinetRelatedAPI} from '@/api/cabinetRelated'
import {BasePageModel} from '@/constants'
import i18n from '@/i18n'
import type {MessageBoard} from '@/types/api/messageBoard'
import ResetIcon from '~icons/ic/round-refresh'
import ViewIcon from '~icons/mdi/magnify'

import {SubstanceFormModal} from './components'


const substanceFormModalRef = ref()
const substanceFormData = ref({})
const dataRef = ref<MessageBoard[]>([])
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




const queryList = () => {

  loadingRef.value = true

  const params = new BasePageModel({
    page: paginationReactive.page,
    pageSize: paginationReactive.pageSize
  })

  CabinetRelatedAPI.messageBoardList(params).then((result => {
    const {data, total} = result.data ?? {}

    dataRef.value = data.map(messageBoard =>
      ({
        ...messageBoard
      })
    )
    paginationReactive.itemCount = total
    loadingRef.value = false
  }))
}


const handleReset = () => {
  paginationReactive.page = 1
  paginationReactive.pageSize = 10
  paginationReactive.itemCount = 0
  queryList()
}


  export default defineComponent({
  components: {NIcon, SubstanceFormModal},
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
    }, { width: number; title: () => any; key: string }, {
      width: number;
      title: () => any;
      key: string;
      ellipsis: { tooltip: boolean }
    }, { width: number; title: () => any; align: string; render: (row) => string; key: string; titleAlign: string }] = [
      {
        type: 'selection',
        disabled (row) {
          return false
        }
      },
      {key: 'messageId', title: 'ID', width: 30,ellipsis: true},
      {key: 'name', title: () => t('TEMP.Cabinet.MessageBoard.name'),width: 40,ellipsis: true},
      {key: 'email', title: () => t('TEMP.Cabinet.MessageBoard.email'),width: 100},
      {key: 'phone', title: () => t('TEMP.Cabinet.MessageBoard.phone'),width: 70},
      {key: 'message', title: () => t('TEMP.Cabinet.MessageBoard.message'),width: 200, ellipsis: {tooltip: true}},
      {
        title: () => t('TEMP.Cabinet.MessageBoard.messageDate'),
        key: 'messageDate',
        width: 80,
        titleAlign: 'center',
        align: 'center',
        render: (row) => (row.messageDate ? TimeUtils.formatTime(row.messageDate, 'YYYY/MM/DD') : '')
      },
    ]


    onMounted(() => queryList())

    return {
      columns,
      data: dataRef,
      checkArray,
      queryList,
      handleReset,
      ReloadIcon,
      ViewIcon,
      TrashBinOutline,
      ResetIcon,
      loading: loadingRef,
      t,
      substanceFormModalRef,
      substanceFormData,
      dialog,
      pagination: paginationReactive,
      rowKey (rowData) {
        return rowData.messageId
      },
      handleCheck (rowKeys) {
        checkedRowKeysRef.value = rowKeys
      },
      showDropdown: showDropdownRef,
      viewOneSubstance() {
        if (checkedRowKeysRef.value.length === 0) {
          window.$message.warning(() => t('VALIDATION.ChooseOneDetail'))
        } else if (checkedRowKeysRef.value.length > 1) {
          window.$message.warning(() => t('VALIDATION.OnlyAllowOneDetail'))
        } else {
          substanceFormData.value = {}
          substanceFormData.value = dataRef.value.filter(m => m.messageId === checkedRowKeysRef.value[0])[0]
          substanceFormModalRef.value.handleShowModal()
        }
      },
      deleteSubstances(){
        if(checkedRowKeysRef.value.length === 0){
          window.$message.warning(()=>t('VALIDATION.ChooseOneDetail'))
          return
        }

        const args = {ids:checkedRowKeysRef.value}
        dialog.warning({
          title: '警告',
          content: '确定要删除这些留言吗?',
          positiveText: '确定',
          negativeText: '取消',
          onPositiveClick: async () => {
            const {code, message} = await CabinetRelatedAPI.deleteMessageBoard(args)
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
      },
      rowProps: (row: MessageBoard) => ({
          style: 'cursor: pointer;',
          onDblclick: () => {
            substanceFormData.value = row
            substanceFormModalRef.value.handleShowModal()
          }
        })
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



          </div>
        </div>

        <div class="flex w-full items-center justify-between space-x-3 sm:justify-end ">

          <n-button icon-placement="left" secondary strong @click="viewOneSubstance">
            <template #icon>
              <n-icon :component="ViewIcon">
                <!--                <AddSharp-icon />-->
              </n-icon>
            </template>
            {{ t('TEMP.Cabinet.Quotation.view') }}
          </n-button>


          <n-popover trigger="hover">
            <template #trigger>
              <n-button icon-placement="left" secondary strong @click="deleteSubstances">
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

    <SubstanceFormModal
      ref="substanceFormModalRef"
      :substance-form-data="substanceFormData"
      @save="queryList"
    />
  </DataTableLayout>
</template>
