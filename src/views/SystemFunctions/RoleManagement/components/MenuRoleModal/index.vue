<script setup lang="ts">
import type {CascaderOption, FormInst, FormValidationError, TransferRenderSourceList, TreeOption} from 'naive-ui'

import type { MenuRoleAndChildren,MessageSchema, Role } from '@/types'
import EditIcon from '~icons/ic/sharp-edit'

export interface Props {
  menuRoleData?: Role
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'save'): void
}>()

const { t } = useI18n<{ message: MessageSchema }>()

const NMessage = useMessage()
const [submitLoading, submitLoadingDispatcher] = useLoading()

const formRef = ref<FormInst | null>(null)
const options = ref<MenuRoleAndChildren[]>([])

const showModal = ref(false)



// const treeData = createData()
const valueRef = ref([])
const renderSourceList: TransferRenderSourceList = function ({
                                                               onCheck,
                                                               pattern
                                                             }) {
  return h(NTree, {
    style: 'margin: 0 4px;',
    keyField: 'value',
    checkable: true,
    selectable: false,
    cascade: true,
    blockLine: true,
    checkOnClick: true,
    data: options.value,
    defaultExpandAll: true,
    pattern,
    checkedKeys: valueRef.value,
    onUpdateCheckedKeys: (checkedKeys: Array<string | number>,option: Array<TreeOption | null>,
    meta: { node: TreeOption | null, action: 'check' | 'uncheck' }) => {
      onCheck(checkedKeys)
      console.log(checkedKeys)
      // Todo 这里不知道怎么拿到半选的父节点
      // console.log("keys = " + checkedKeys)
      // console.log("option = " + option)
      // console.log("meta = " + meta)
      // console.log("=================================")
    },
    onUpdateIndeterminateKeys: (keys: Array<string | number>, option: Array<TreeOption | null>)=>{
      // Todo 这里可以单独获得半选中的父节点,但是不知道后续怎么操作
      // console.log("keys = " + keys)
      // console.log("option = " + option)
      // console.log("=================================")
    }
  })
}


const handleSubmit = async () => {
  try {
    await formRef.value!.validate()
  } catch (errors) {
    const errorMessage = (errors as FormValidationError[])[0][0].message
    if (errorMessage) {
      NMessage.error(errorMessage)
    }
    return false
  }

  if (submitLoading.value) {
    return true
  }
  submitLoadingDispatcher.loading()
  try {
    const args = {menuIds:valueRef.value}
    const {code,message} = await MenuAPI.addMenuIdByRoleId(props.menuRoleData.roleId,args)
    if(code == 200){
      NMessage.success(message)
      showModal.value = false
    }else{
      NMessage.error(message)
    }
  } catch (err: any) {
    if (err.message) {
      NMessage.error(err.message)
    }
  }
  emit('save')
  submitLoadingDispatcher.loaded()
  return true
}


function flattenTree (list: undefined | MenuRoleAndChildren[]): MenuRoleAndChildren[] {
  const result: MenuRoleAndChildren[] = []
  function flatten (_list: MenuRoleAndChildren[] = []) {
    _list.forEach((item) => {
      result.push(item)
      if(item.children != null){
        flatten(item.children)
      }
    })
  }
  flatten(list)
  return result
}

const handleCancel = () => {
  showModal.value = false
  emit('save')
}

/**
 * @todo 重构
 * 使用参数传递的方式，不要用 defineExpose 暴露方法给父组件
 */

const handleShowModal = () => {
  showModal.value = true
  emit('save')
}

watch(
  () => props.menuRoleData,
  async (newValue) => {
    if (newValue && typeof newValue.roleId !== 'undefined') {
      const {code:code1, data:data1} = await MenuAPI.allMenuAneChildren()
      const {code:code2, data:data2} = await MenuAPI.allMenuIdByRoleId(newValue.roleId)
      if(code1 == 200 && code2 == 200){
        options.value = data1.map(item=>{
          const newItem = { ...item }
          if(Array.isArray(newItem.children) && newItem.children.length === 0){
            newItem.children = null
          }
          return newItem
        })
        valueRef.value = data2
      }else {
        NMessage.error('数据读取错误')
      }

    } else {
      // formData.value = {}
    }
  },
  { immediate: true, deep: true  }
  // { immediate: true, deep: true  }
)

defineExpose({
  handleShowModal
})
</script>

<template>
  <NModal
    v-model:show="showModal"
    class="!my-6 sm:!w-[800px] "
    preset="dialog"
    :title="t('TEMP.RoleManagement.EditMenuRole')"
    :loading="submitLoading"
    :positive-text="t('COMMON.Confirm')"
    :negative-text="t('COMMON.Cancel')"
    @positive-click="handleSubmit"
    @negative-click="handleCancel"
  >
    <template #icon>
      <NIcon
        size="24"
        :component="EditIcon"
      />
    </template>

    <NForm
      ref="formRef"
      label-width="auto"
      require-mark-placement="right-hanging"
      class="flex flex-col"
    >

      <nGrid :cols="24" >
        <NFormItemGi
:span="24"
                     path="roleKey"
                     :label="t('TEMP.RoleManagement.roleKey')"
                     :show-label ="false"
        >

          <n-transfer
            ref="transfer"
            style="height:500px"
            v-model:value="valueRef"
            :options="flattenTree(options)"
            :render-source-list="renderSourceList"
            source-filterable
            target-filterable
          />

        </NFormItemGi>
      </nGrid>


    </NForm>

  </NModal>
</template>


<style scoped>
.light-green {
  height: 108px;
  background-color: rgba(0, 128, 0, 0.12);
}
.green {
  height: 108px;
  background-color: rgba(0, 128, 0, 0.24);
}
</style>
