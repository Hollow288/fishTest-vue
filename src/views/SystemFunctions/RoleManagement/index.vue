<script lang="ts">
import type { DataTableRowKey} from 'naive-ui'
import {NIcon, useDialog, useMessage} from 'naive-ui'

import {BasePageModel} from '@/constants'
import EditIcon from '~icons/ic/sharp-edit'
import i18n from '@/i18n'
import type {Menu} from '@/types/api/menu'
import type {Role} from '@/types/api/role'
import CheckIcon from '~icons/ic/baseline-check'
import ResetIcon from '~icons/ic/round-refresh'
import SearchIcon from '~icons/line-md/search'

import {RoleFormModal,UserRoleModal} from './components'
import {AddSharp,TrashBinOutline} from "@vicons/ionicons5";

const dataRef = ref<Menu[]>([])
const roleFormData = ref({})
const userRoleData = ref({})
const {t} = i18n.global
const loadingRef = ref(true)
const isRoleEdit = ref(true)

const roleFormModalRef = ref()
const userRoleModalRef = ref()


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

  RoleAPI.list(params).then((result => {
    const {data, total} = result.data ?? {}

    dataRef.value = data.map(role =>
      ({
        ...role,
        status: role.status == 0
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
  components: {NIcon, RoleFormModal,SearchIcon,UserRoleModal},
  setup() {

    window.$message = useMessage()


    const checkedRowKeysRef = ref<[]>([])
    const dialog = useDialog()

    const columns = [
      {
        type: 'selection',
        disabled (row: Role) {
          return false
        }
      },
      {key: 'roleId', title: 'ID', width: 60, ellipsis: true},
      {key: 'roleKey', title: () => t('TEMP.RoleManagement.roleKey'), width: 120},
      {key: 'roleName', title: () => t('TEMP.RoleManagement.roleName'), width: 100},
      {
        key: 'createTime', title: () => t('TEMP.RoleManagement.createTime'), width: 100,
        render: (row) => (row.createTime ? TimeUtils.formatTime(row.createTime, 'YYYY/MM/DD') : '')
      },
      {
        key: 'updateTime', title: () => t('TEMP.RoleManagement.updateTime'), width: 100,
        render: (row) => (row.updateTime ? TimeUtils.formatTime(row.updateTime, 'YYYY/MM/DD') : '')
      },
      {key: 'remark', title: () => t('TEMP.RoleManagement.remark'), ellipsis: {tooltip: true},width: 100},
      {
        title: () => t('TEMP.RoleManagement.status'),
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
                    // isEdit.value = true
                    userRoleModalRef.value.handleShowModal()
                    userRoleData.value = row
                  }
                },
                {
                  default: () => t('TEMP.RoleManagement.ChangePeople')
                }
              ),
              h(
                NButton,
                {
                  type: 'default',
                  size: 'small',
                  onClick: () => {
                    // showResetPasswordDialog.value = true
                    // currentId.value = row.userId
                  }
                },
                {
                  default: () => t('TEMP.RoleManagement.ChangeMenu')
                }
              )
            ]
          )
      }
    ]

    onMounted(() => {
      console.log("fat的挂载被调用")
      queryList()
    }
)

    return {
      columns,
      data: dataRef,
      loading: loadingRef,
      queryList,
      queryParams,
      SearchIcon,
      ResetIcon,
      EditIcon,
      TrashBinOutline,
      AddSharp,
      handleReset,
      isRoleEdit,
      roleFormData,
      userRoleData,
      roleFormModalRef,
      userRoleModalRef,
      t,
      rowKey: (row: Role) => row.roleId,
      pagination: paginationReactive,
      deleteRoles(){
        if(checkedRowKeysRef.value.length === 0){
          window.$message.warning(()=>t('VALIDATION.ChooseOneAtLeast'))
          return
        }

        const willBeDeleteRole = ref([])
        willBeDeleteRole.value = dataRef.value.filter(m => checkedRowKeysRef.value.indexOf(m.roleId) > -1)
        const willDeleteName =  willBeDeleteRole.value.map(n => n.roleName).join(',')
        const args = {ids:checkedRowKeysRef.value}
        dialog.warning({
            title: '警告',
            content: `确定删除角色"${willDeleteName}"`,
            positiveText: '确定',
            negativeText: '取消',
            onPositiveClick: async() => {
              const {code, message} = await RoleAPI.delete(args)
              if(code == '200'){
                queryList()
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
      editOneRole(){
        if(checkedRowKeysRef.value.length === 0){
          window.$message.warning(()=>t('VALIDATION.ChooseOneDetail'))
        }else if(checkedRowKeysRef.value.length > 1){
          window.$message.warning(()=>t('VALIDATION.OnlyAllowOneDetail'))
        }else {
          isRoleEdit.value = true
          roleFormData.value = {}
          roleFormData.value = dataRef.value.filter(m => m.roleId === checkedRowKeysRef.value[0])[0]

          roleFormModalRef.value.handleShowModal()
        }

      },
      createNewRole(){
        isRoleEdit.value = false
        roleFormData.value = {}
        // init
        roleFormData.value.status = true

        roleFormModalRef.value.handleShowModal()
        // menuFormData.value = menuRightClickData.value
      },
      handleCheck (rowKeys) {
        checkedRowKeysRef.value = rowKeys
      },
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
              :placeholder="t('TEMP.RoleManagement.RoleKeywordSearch')"
              @keydown.enter="queryList"
            >
              <template #prefix>
                <NIcon
                  :component="SearchIcon"
                  class="mr-1"
                />
              </template>
            </NInput>

            <n-button icon-placement="left" secondary strong round   @click="queryList" >
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

          <n-button icon-placement="left" secondary strong @click="createNewRole">
            <template #icon>
              <n-icon :component="AddSharp">
                <!--                <AddSharp-icon />-->
              </n-icon>
            </template>
            {{ t('COMMON.Create') }}
          </n-button>

          <n-button icon-placement="left" secondary strong @click="editOneRole">
            <template #icon>
              <n-icon :component="EditIcon">
                <!--                <AddSharp-icon />-->
              </n-icon>
            </template>
            {{ t('COMMON.Edit') }}
          </n-button>

          <n-popover trigger="hover">
            <template #trigger>
          <n-button icon-placement="left" secondary strong @click="deleteRoles">
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
      :remote="true"
      :columns="columns"
      :row-key="rowKey"
      :data="data"
      :loading="loading"
      :scroll-x="1000"
      :cascade="false"
      flex-height
      allow-checking-not-loaded
      :pagination="pagination"
      @update:page="() => queryList()"
      @update:checked-row-keys="handleCheck"
    />

    <RoleFormModal
      ref="roleFormModalRef"
      :is-edit="isRoleEdit"
      :role-form-data="roleFormData"
      @save="queryList"
    />

    <UserRoleModal
      ref="userRoleModalRef"
      :user-role-data="userRoleData"
      @save="queryList"
    />

  </DataTableLayout>
</template>
