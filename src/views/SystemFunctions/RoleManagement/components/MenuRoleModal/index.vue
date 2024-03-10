<script setup lang="ts">
import type {FormInst, FormValidationError , TransferRenderSourceList } from 'naive-ui'

import type { MessageSchema, User, Role, MenuRoleAndChildren } from '@/types'
import CreateIcon from '~icons/ic/sharp-add'
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
const formData = ref<User>({})
let options = ref<MenuRoleAndChildren[]>([])

const showModal = ref(false)


// const treeData = createData()
const valueRef = ref<Array<string | number>>([])
const renderSourceList: TransferRenderSourceList = function ({
                                                               onCheck,
                                                               pattern
                                                             }) {
  return h(NTree, {
    style: 'margin: 0 4px;',
    keyField: 'value',
    checkable: true,
    selectable: false,
    blockLine: true,
    checkOnClick: true,
    data: options,
    pattern,
    checkedKeys: valueRef.value,
    onUpdateCheckedKeys: (checkedKeys: Array<string | number>) => {
      onCheck(checkedKeys)
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

  formData.value = {
    ...formData.value,
    status: formData.value.status?'0':'1',
  }
  if (props.isEdit) {
    try {
      const temFormData = ref({})
      temFormData.value = formData.value
      temFormData.value.roleKey = `ROLE_${ formData.value.roleKey }`
      const { message, code } = await RoleAPI.update(formData.value.roleId, temFormData.value)
      if(code == 200){
        NMessage.success(message!)
        showModal.value = false
      }else {
        NMessage.error(message!)
      }
    } catch (err: any) {
      if (err.message) {
        NMessage.error(err.message)
      }
    }
  } else {
    try {
      const temFormData = ref({})
      temFormData.value = formData.value
      temFormData.value.roleKey = `ROLE_${ formData.value.roleKey }`
      const { message, code } = await RoleAPI.create(temFormData.value)
      if(code == 200){
        NMessage.success(message!)
        showModal.value = false
      }else {
        NMessage.error(message!)
      }
    } catch (err: any) {
      if (err.message) {
        NMessage.error(err.message)
      }
    }
  }
  emit('save')
  submitLoadingDispatcher.loaded()
  return true
}

const handleCancel = () => {
  showModal.value = false
  emit('save')
}

/**
 * @todo 重构
 * 使用参数传递的方式，不要用 defineExpose 暴露方法给父组件
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handleShowModal = () => {
  showModal.value = true
  emit('save')
}

watch(
  () => props.menuRoleData,
  async (newValue) => {
    if (newValue && typeof newValue.roleId !== 'undefined') {
      const {code:code1, data:data1} = await MenuAPI.allMenuAneChildren()
      options = data1
      formData.value = {
        ...newValue,
        status: newValue.status === '0' ? true : newValue.status === '1' ? false : newValue.status,
        roleKey: newValue.roleKey ? newValue.roleKey.replace(/^ROLE_/, '') : ''
      }

    } else {
      formData.value = {}
    }
  },
  { immediate: true }
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
        :component="isEdit ? EditIcon : CreateIcon"
      />
    </template>

    <NForm
      ref="formRef"
      :model="formData"
      label-width="auto"
      require-mark-placement="right-hanging"
      class="flex flex-col"
    >

      <nGrid :cols="24" >
        <NFormItemGi :span="24"
                     path="roleKey"
                     :label="t('TEMP.RoleManagement.roleKey')"
                     :show-label ="false"
        >

          <n-transfer
            ref="transfer"
            style="height:500px"
            v-model:value="value"
            :options="options"
            :render-source-list="renderSourceList"
            source-filterable
          />

          <NTree>

          </NTree>


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
