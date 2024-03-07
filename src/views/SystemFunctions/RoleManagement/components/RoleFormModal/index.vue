<script setup lang="ts">
import type {FormInst, FormRules, FormValidationError } from 'naive-ui'

import type { MessageSchema, User, Role } from '@/types'
import CreateIcon from '~icons/ic/sharp-add'
import EditIcon from '~icons/ic/sharp-edit'

export interface Props {
  roleFormData?: Role
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

const roleRules: FormRules = {
  roleKey: [
    {
      required: true,
      trigger: ['blur', 'input'],
      message: () => t('TEMP.Validation.roleKey'),
      renderMessage: () => t('TEMP.Validation.roleKey')
    }
  ],
  roleName: [
    {
      required: true,
      trigger: ['blur', 'input'],
      message: () => t('TEMP.Validation.roleName'),
      renderMessage: () => t('TEMP.Validation.roleName')
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
  () => props.roleFormData,
  (newValue) => {
    if (newValue) {
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
    class="!my-6"
    preset="dialog"
    :title="isEdit ? t('TEMP.RoleManagement.EditRole') : t('TEMP.RoleManagement.CreateRole')"
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
      :rules="roleRules"
      label-width="auto"
      require-mark-placement="right-hanging"
      class="flex flex-col"
    >

      <nGrid :cols="24" >
        <NFormItemGi :span="24"
                     path="roleKey"
                     :label="t('TEMP.RoleManagement.roleKey')"
        >

          <n-input-group>
            <n-input-group-label>ROLE_</n-input-group-label>
            <NInput
              v-model:value="formData.roleKey"
              :placeholder="t('TEMP.RoleManagement.roleKey')"
              maxlength="32"
              show-count
              clearable
            />
            <!--            <n-input-group-label>.com</n-input-group-label>-->
          </n-input-group>

        </NFormItemGi>
      </nGrid>

      <nGrid :cols="24" >
        <NFormItemGi :span="24"
                     path="roleName"
                     :label="t('TEMP.RoleManagement.roleName')"
        >
          <NInput
            v-model:value="formData.roleName"
            :placeholder="t('TEMP.RoleManagement.roleName')"
            maxlength="64"
            show-count
            clearable
          />
        </NFormItemGi>
      </nGrid>

      <nGrid :cols="24" >
        <NFormItemGi :span="24"
                     path="remark"
                     :label="t('TEMP.RoleManagement.remark')"
        >
          <NInput
            v-model:value="formData.remark"
            :placeholder="t('TEMP.RoleManagement.remark')"
            maxlength="200"
            type="textarea"
            show-count
            clearable
          />
        </NFormItemGi>
      </nGrid>

      <nGrid :cols="24">


        <NFormItemGi :span="24"
                     path="status"
                     :label="t('TEMP.RoleManagement.status')" label-placement="left"
        >
          <!--          <n-switch v-model:value="formData.status" />-->

          <n-switch v-model:value="formData.status">
            <template #checked>
              自然赠予你，树冠 微风 肩头的暴雨
            </template>
            <template #unchecked>
              片刻后生成，平衡 忠诚 不息的身体
            </template>
          </n-switch>
        </NFormItemGi>

      </nGrid>

    </NForm>

    <NForm
      v-else
      ref="formRef"
      :model="formData"
      :rules="roleRules"
      label-width="auto"
      require-mark-placement="right-hanging"
      class="flex flex-col"
    >
      <nGrid :cols="24" >
        <NFormItemGi :span="24"
                     path="roleKey"
                     :label="t('TEMP.RoleManagement.roleKey')"
        >

          <n-input-group>
            <n-input-group-label>ROLE_</n-input-group-label>
            <NInput
              v-model:value="formData.roleKey"
              :placeholder="t('TEMP.RoleManagement.roleKey')"
              maxlength="32"
              show-count
              clearable
            />
            <!--            <n-input-group-label>.com</n-input-group-label>-->
          </n-input-group>

        </NFormItemGi>
      </nGrid>

      <nGrid :cols="24" >
        <NFormItemGi :span="24"
                     path="roleName"
                     :label="t('TEMP.RoleManagement.roleName')"
        >
          <NInput
            v-model:value="formData.roleName"
            :placeholder="t('TEMP.RoleManagement.roleName')"
            maxlength="64"
            show-count
            clearable
          />
        </NFormItemGi>
      </nGrid>

      <nGrid :cols="24" >
        <NFormItemGi :span="24"
                     path="remark"
                     :label="t('TEMP.RoleManagement.remark')"
        >
          <NInput
            v-model:value="formData.remark"
            :placeholder="t('TEMP.RoleManagement.remark')"
            maxlength="200"
            type="textarea"
            show-count
            clearable
          />
        </NFormItemGi>
      </nGrid>

      <nGrid :cols="24">


        <NFormItemGi :span="24"
                     path="status"
                     :label="t('TEMP.RoleManagement.status')" label-placement="left"
        >
<!--          <n-switch v-model:value="formData.status" />-->

          <n-switch v-model:value="formData.status">
            <template #checked>
              自然赠予你，树冠 微风 肩头的暴雨
            </template>
            <template #unchecked>
              片刻后生成，平衡 忠诚 不息的身体
            </template>
          </n-switch>
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
