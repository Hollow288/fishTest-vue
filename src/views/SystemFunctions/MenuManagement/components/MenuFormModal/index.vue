<script setup lang="ts">
import type {FormInst, FormItemRule, FormRules, FormValidationError } from 'naive-ui'

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
const tempUserData = ref<User>({})
const createFormData = reactive({
  userName: '',
  passWord: ''
})
const showModal = ref(false)

const editRules: FormRules = {
  name: [
    {
      required: true,
      trigger: ['blur', 'input'],
      message: () => t('TEMP.Validation.Name'),
      renderMessage: () => t('TEMP.Validation.Name')
    }
  ],
  email: [
    {
      key: 'edit',
      trigger: ['blur', 'change'],
      message: () => t('TEMP.Validation.Email'),
      renderMessage: () => t('TEMP.Validation.Email')
    }
  ]
}

const createRules: FormRules = {
  userName: [
    {
      required: true,
      trigger: ['blur', 'input'],
      message: () => t('TEMP.Validation.Username'),
      renderMessage: () => t('TEMP.Validation.Username')
    }
  ],
  passWord: [
    {
      required: true,
      trigger: ['blur', 'input'],
      message: () => t('TEMP.Validation.Password'),
      renderMessage: () => t('TEMP.Validation.Password')
    },
    {
      validator: (_: FormItemRule, value: string) => value.length >= 6,
      trigger: ['blur', 'input'],
      message: () => t('TEMP.Validation.PasswordLength'),
      renderMessage: () => t('TEMP.Validation.PasswordLength')
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

  if (props.isEdit) {
    try {
      const { message } = await UserAPI.update(formData.value.userId!, formData.value)
      NMessage.success(message!)
      showModal.value = false
      emit('save')
    } catch (err: any) {
      if (err.message) {
        NMessage.error(err.message)
      }
    }
  } else {
    try {
      const { code , message } = await UserAPI.create(createFormData)
      if(code == 200){
        NMessage.success(message!)
        createFormData.userName = ''
        createFormData.passWord = ''
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
  // formData.value = {}
  formData.value = tempUserData.value
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
      :rules="editRules"
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
            maxlength="20"
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
            maxlength="20"
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
            maxlength="30"
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
            maxlength="30"
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
            maxlength="30"
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
            maxlength="30"
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
            maxlength="30"
            show-count
            clearable
          />
        </NFormItemGi>

      </nGrid>















      <!--      <NFormItem-->
<!--        path="phoneNumber"-->
<!--        :label="t('TEMP.User.PhoneNumber')"-->
<!--      >-->
<!--        <NInput-->
<!--          v-model:value="formData.phoneNumber"-->
<!--          :placeholder="t('TEMP.Validation.PhoneNumber')"-->
<!--          maxlength="20"-->
<!--          show-count-->
<!--          clearable-->
<!--        />-->
<!--      </NFormItem>-->

<!--      <NFormItem-->
<!--        path="birthDate"-->
<!--        :label="t('TEMP.User.BirthDate')"-->
<!--      >-->
<!--        <NDatePicker-->
<!--          v-model:formatted-value="formData.birthDate"-->
<!--          clearable-->
<!--        />-->
<!--      </NFormItem>-->

<!--      <NFormItem-->
<!--        path="address"-->
<!--        :label="t('TEMP.User.Address')"-->
<!--      >-->
<!--        <NInput-->
<!--          v-model:value="formData.address"-->
<!--          :placeholder="t('TEMP.Validation.Address')"-->
<!--          maxlength="30"-->
<!--          show-count-->
<!--          clearable-->
<!--        />-->
<!--      </NFormItem>-->

<!--      <NFormItem-->
<!--        path="biography"-->
<!--        :label="t('TEMP.User.Biography')"-->
<!--      >-->
<!--        <NInput-->
<!--          v-model:value="formData.biography"-->
<!--          :placeholder="t('TEMP.Validation.Biography')"-->
<!--          maxlength="300"-->
<!--          type="textarea"-->
<!--          show-count-->
<!--          clearable-->
<!--        />-->
<!--      </NFormItem>-->
    </NForm>

    <NForm
      v-else
      ref="formRef"
      :model="createFormData"
      :rules="createRules"
      label-placement="left"
      label-width="auto"
      require-mark-placement="right-hanging"
      class="flex flex-col"
    >
      <NFormItem
        path="userName"
        :label="t('TEMP.User.Username')"
      >
        <NInput
          v-model:value="createFormData.userName"
          :placeholder="t('TEMP.Validation.Username')"
          maxlength="20"
          show-count
          clearable
          :input-props="{ autocomplete: 'userName' }"
        />
      </NFormItem>

      <NFormItem
        path="password"
        :label="t('TEMP.User.Password')"
      >
        <NInput
          v-model:value="createFormData.passWord"
          type="password"
          :placeholder="t('TEMP.Validation.Password')"
          maxlength="20"
          clearable
          show-password-on="click"
          :input-props="{ autocomplete: 'password' }"
        />
      </NFormItem>
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
