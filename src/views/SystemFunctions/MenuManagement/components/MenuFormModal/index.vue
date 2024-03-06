<script setup lang="ts">
import type {FormInst, FormRules, FormValidationError } from 'naive-ui'

import type { MessageSchema, User, Menu } from '@/types'
import CreateIcon from '~icons/ic/sharp-add'
import EditIcon from '~icons/ic/sharp-edit'

export interface Props {
  menuFormData?: Menu
  isEdit: boolean
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

const showModal = ref(false)

const menuRules: FormRules = {
  keyName: [
    {
      required: true,
      trigger: ['blur', 'input'],
      message: () => t('TEMP.Validation.keyName'),
      renderMessage: () => t('TEMP.Validation.keyName')
    }
  ]
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
    visible: formData.value.visible?'0':'1',
    status: formData.value.status?'0':'1',
    disableAuth: formData.value.disableAuth?'0':'1',
    dismissTab: formData.value.dismissTab?'0':'1',
    isLeaf: formData.value.isLeaf?'0':'1'
  }
  if (props.isEdit) {
    try {
      const { message, code } = await MenuAPI.update(formData.value.menuId, formData.value)
      if(code == 200){
        NMessage.success(message!)
        showModal.value = false
        emit('save')
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
      const { message, code } = await MenuAPI.create(formData.value)
      if(code == 200){
        NMessage.success(message!)
        showModal.value = false
        emit('save')
      }else {
        NMessage.error(message!)
      }
    } catch (err: any) {
      if (err.message) {
        NMessage.error(err.message)
      }
    }
  }

  submitLoadingDispatcher.loaded()
  return true
}

const handleCancel = () => {
  showModal.value = false
}

/**
 * @todo 重构
 * 使用参数传递的方式，不要用 defineExpose 暴露方法给父组件
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handleShowModal = () => {
  showModal.value = true
}

watch(
  () => props.menuFormData,
  (newValue) => {
    if (newValue) {
      formData.value = {
        ...newValue,
        visible: newValue.visible === '0' ? true : newValue.visible === '1' ? false : newValue.visible,
        status: newValue.status === '0' ? true : newValue.status === '1' ? false : newValue.status,
        disableAuth: newValue.disableAuth === '0' ? true : newValue.disableAuth === '1' ? false : newValue.disableAuth,
        dismissTab: newValue.dismissTab === '0' ? true : newValue.dismissTab === '1' ? false : newValue.dismissTab,
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
    class="!my-6"
    preset="dialog"
    :title="isEdit ? t('TEMP.MenuManagement.EditMenu') : t('TEMP.MenuManagement.CreateMenu')"
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
      v-if="isEdit"
      ref="formRef"
      :model="formData"
      :rules="menuRules"
      label-width="auto"
      require-mark-placement="right-hanging"
      class="flex flex-col"
    >

      <nGrid :cols="24" >
        <NFormItemGi :span="24"
          path="keyName"
          :label="t('TEMP.MenuManagement.keyName')"
        >
          <NInput
            v-model:value="formData.keyName"
            :placeholder="t('TEMP.MenuManagement.keyName')"
            maxlength="32"
            show-count
            clearable
          />
        </NFormItemGi>
      </nGrid>

      <nGrid :cols="24" >
        <NFormItemGi :span="24"
          path="title"
          :label="t('TEMP.MenuManagement.title')"
        >
          <NInput
            v-model:value="formData.title"
            :placeholder="t('TEMP.MenuManagement.title')"
            maxlength="64"
            show-count
            clearable
          />
        </NFormItemGi>
      </nGrid>

      <nGrid :cols="24" >
        <NFormItemGi :span="24"
          path="label"
          :label="t('TEMP.MenuManagement.label')"
        >
          <NInput
            v-model:value="formData.label"
            :placeholder="t('TEMP.MenuManagement.label')"
            maxlength="50"
            show-count
            clearable
          />
        </NFormItemGi>
      </nGrid>

      <nGrid :cols="24" >
        <NFormItemGi :span="24"
          path="path"
          :label="t('TEMP.MenuManagement.path')"
        >
          <NInput
            v-model:value="formData.path"
            :placeholder="t('TEMP.MenuManagement.path')"
            maxlength="100"
            show-count
            clearable
          />
        </NFormItemGi>

      </nGrid>

      <nGrid :cols="24" >

        <NFormItemGi :span="24"
          path="icon"
          :label="t('TEMP.MenuManagement.icon')"
        >
          <NInput
            v-model:value="formData.icon"
            :placeholder="t('TEMP.MenuManagement.icon')"
            maxlength="50"
            show-count
            clearable
          />
        </NFormItemGi>

      </nGrid>

      <nGrid :cols="24" >
        <NFormItemGi :span="24"
          path="component"
          :label="t('TEMP.MenuManagement.component')"
        >
          <NInput
            v-model:value="formData.component"
            :placeholder="t('TEMP.MenuManagement.component')"
            maxlength="120"
            show-count
            clearable
          />
        </NFormItemGi>

      </nGrid>


      <nGrid :cols="24" >
        <NFormItemGi :span="24"
                     path="remark"
                     :label="t('TEMP.MenuManagement.remark')"
        >
          <NInput
            v-model:value="formData.remark"
            :placeholder="t('TEMP.MenuManagement.remark')"
            maxlength="120"
            show-count
            clearable
          />
        </NFormItemGi>

      </nGrid>

      <nGrid :cols="24" :x-gap="12">
        <NFormItemGi :span="12"
                     path="visible"
                     :label="t('TEMP.MenuManagement.visible')" label-placement="left"
        >

          <n-switch v-model:value="formData.visible" />
        </NFormItemGi>

        <NFormItemGi :span="12"
                     path="status"
                     :label="t('TEMP.MenuManagement.status')" label-placement="left"
        >
          <n-switch v-model:value="formData.status" />
        </NFormItemGi>

      </nGrid>

      <nGrid :cols="24" :x-gap="12">
        <NFormItemGi :span="12"
                     path="disableAuth"
                     :label="t('TEMP.MenuManagement.DisableAuth')" label-placement="left"
        >

          <n-switch v-model:value="formData.disableAuth" />
        </NFormItemGi>

        <NFormItemGi :span="12"
                     path="dismissTab"
                     :label="t('TEMP.MenuManagement.DismissTab')" label-placement="left"
        >
          <n-switch v-model:value="formData.dismissTab" />
        </NFormItemGi>

      </nGrid>

    </NForm>

    <NForm
      v-else
      ref="formRef"
      :model="formData"
      :rules="menuRules"
      label-width="auto"
      require-mark-placement="right-hanging"
      class="flex flex-col"
    >
      <nGrid :cols="24" >
        <NFormItemGi :span="24"
                     path="keyName"
                     :label="t('TEMP.MenuManagement.keyName')"
        >
          <NInput
            v-model:value="formData.keyName"
            :placeholder="t('TEMP.MenuManagement.keyName')"
            maxlength="32"
            show-count
            clearable
          />
        </NFormItemGi>
      </nGrid>

      <nGrid :cols="24" >
        <NFormItemGi :span="24"
                     path="title"
                     :label="t('TEMP.MenuManagement.title')"
        >
          <NInput
            v-model:value="formData.title"
            :placeholder="t('TEMP.MenuManagement.title')"
            maxlength="64"
            show-count
            clearable
          />
        </NFormItemGi>
      </nGrid>

      <nGrid :cols="24" >
        <NFormItemGi :span="24"
                     path="label"
                     :label="t('TEMP.MenuManagement.label')"
        >
          <NInput
            v-model:value="formData.label"
            :placeholder="t('TEMP.MenuManagement.label')"
            maxlength="50"
            show-count
            clearable
          />
        </NFormItemGi>
      </nGrid>

      <nGrid :cols="24" >
        <NFormItemGi :span="24"
                     path="path"
                     :label="t('TEMP.MenuManagement.path')"
        >
          <NInput
            v-model:value="formData.path"
            :placeholder="t('TEMP.MenuManagement.path')"
            maxlength="100"
            show-count
            clearable
          />
        </NFormItemGi>

      </nGrid>

      <nGrid :cols="24" >

        <NFormItemGi :span="24"
                     path="icon"
                     :label="t('TEMP.MenuManagement.icon')"
        >
          <NInput
            v-model:value="formData.icon"
            :placeholder="t('TEMP.MenuManagement.icon')"
            maxlength="50"
            show-count
            clearable
          />
        </NFormItemGi>

      </nGrid>

      <nGrid :cols="24" >
        <NFormItemGi :span="24"
                     path="component"
                     :label="t('TEMP.MenuManagement.component')"
        >
          <NInput
            v-model:value="formData.component"
            :placeholder="t('TEMP.MenuManagement.component')"
            maxlength="120"
            show-count
            clearable
          />
        </NFormItemGi>

      </nGrid>

      <nGrid :cols="24" >
        <NFormItemGi :span="24"
                     path="remark"
                     :label="t('TEMP.MenuManagement.remark')"
        >
          <NInput
            v-model:value="formData.remark"
            :placeholder="t('TEMP.MenuManagement.remark')"
            maxlength="120"
            show-count
            clearable
          />
        </NFormItemGi>

      </nGrid>

      <nGrid :cols="24" :x-gap="12">
        <NFormItemGi :span="12"
                     path="visible"
                     :label="t('TEMP.MenuManagement.visible')" label-placement="left"
        >

          <n-switch v-model:value="formData.visible" />
        </NFormItemGi>

        <NFormItemGi :span="12"
                     path="status"
                     :label="t('TEMP.MenuManagement.status')" label-placement="left"
        >
          <n-switch v-model:value="formData.status" />
        </NFormItemGi>

      </nGrid>

      <nGrid :cols="24" :x-gap="12">
        <NFormItemGi :span="12"
                     path="disableAuth"
                     :label="t('TEMP.MenuManagement.DisableAuth')" label-placement="left"
        >

          <n-switch v-model:value="formData.disableAuth" />
        </NFormItemGi>

        <NFormItemGi :span="12"
                     path="dismissTab"
                     :label="t('TEMP.MenuManagement.DismissTab')" label-placement="left"
        >
          <n-switch v-model:value="formData.dismissTab" />
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
