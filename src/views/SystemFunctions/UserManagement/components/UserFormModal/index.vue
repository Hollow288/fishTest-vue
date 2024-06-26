<script setup lang="ts">
import type {FormInst, FormItemRule, FormRules, FormValidationError, UploadFileInfo, UploadInst} from 'naive-ui'

import type { MessageSchema, User } from '@/types'
import UserAvatarIcon from '~icons/carbon/user-avatar-filled-alt'
import CreateIcon from '~icons/ic/sharp-add'
import EditIcon from '~icons/ic/sharp-edit'

export interface Props {
  userFormData?: User
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
const uploadRef = ref<UploadInst | null>(null)
const formData = ref<User>({})
const tempUserData = ref<User>({})
const createFormData = reactive({
  userName: '',
  passWord: ''
})
const currentFile = ref<File | null>(null)
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
  nickName: [
    {
      required: true,
      trigger: ['blur', 'input'],
      message: () => t('TEMP.Validation.nickName'),
      renderMessage: () => t('TEMP.Validation.nickName')
    }
  ],
  // lastName: [
  //   {
  //     required: true,
  //     trigger: ['blur', 'input'],
  //     message: () => t('TEMP.Validation.LastName'),
  //     renderMessage: () => t('TEMP.Validation.LastName')
  //   }
  // ],
  email: [
    {
      key: 'edit',
      trigger: ['blur', 'change'],
      message: () => t('TEMP.Validation.Email'),
      renderMessage: () => t('TEMP.Validation.Email')
    },
    {
      pattern: /^([a-zA-Z]|[0-9])(\w|-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/,
      trigger: ['input', 'blur'],
      message: () => t('TEMP.Validation.EmailFormat'),
      renderMessage: () => t('TEMP.Validation.EmailFormat')
    }
  ],
  phoneNumber: [
    {
      pattern: /^[1][3456789]\d{9}$/,
      trigger: ['input', 'blur'],
      message: () => t('TEMP.Validation.PhoneNumberFormat'),
      renderMessage: () => t('TEMP.Validation.PhoneNumberFormat')
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

const uploadAvatarUrl = (options: { fileList: UploadFileInfo[] }) => {
  const [file] = options.fileList
  currentFile.value = file?.file ?? null
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
    uploadRef.value!.submit()
    if (currentFile.value) {
      try {
        const { data, message } = await UploadAPI.uploadAvatarFile({
          file: currentFile.value
        })
        formData.value.avatarUrl = data.path
        if (message) {
          NMessage.success(message)
        }
      } catch (err) {
        if (err instanceof Error && err.message) {
          NMessage.error(err.message)
        }
        submitLoadingDispatcher.loaded()
        return false
      }
    }
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


const options = computed(() => ['@gmail.com', '@163.com', '@qq.com'].map((suffix) => {
    if(typeof formData.value.email === 'undefined' || formData.value.email == null || formData.value.email === ""){
      return {
        label:  suffix,
        value:  suffix
      }
    }else{
      const prefix = formData.value.email.split('@')[0]
      return {
        label: prefix + suffix,
        value: prefix + suffix
      }
    }

  }))

/**
 * @todo 重构
 * 使用参数传递的方式，不要用 defineExpose 暴露方法给父组件
 */
const handleShowModal = () => {
  showModal.value = true
  emit('save')
}

watch(
  () => props.userFormData,
  (newValue) => {
    if (newValue) {
      formData.value = {
        ...newValue,
        ...(newValue.birthDate && {
          birthDate: TimeUtils.formatTime(newValue.birthDate, 'YYYY-MM-DD')
        }),
        gender : parseInt(newValue.gender,10)
      }
      tempUserData.value = {
        ...newValue,
        ...(newValue.birthDate && {
          birthDate: TimeUtils.formatTime(newValue.birthDate, 'YYYY-MM-DD')
        }),
        gender : parseInt(newValue.gender,10)
      }
    } else {
      formData.value = {}
      tempUserData.value = {}
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
    :title="isEdit ? t('TEMP.UserManagement.EditUser') : t('TEMP.UserManagement.CreateUser')"
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
      label-placement="left"
      label-width="auto"
      require-mark-placement="right-hanging"
      class="flex flex-col"
    >
      <NFormItem
        path="avatarUrl"
        :label="t('TEMP.User.Avatar')"
      >
        <NUpload
          ref="uploadRef"
          full-path
          :max="1"
          list-type="image-card"
          :default-upload="false"
          @change="uploadAvatarUrl"
        >
          <template v-if="formData.avatarUrl">
            <NAvatar
              :size="80"
              :src="formData.avatarUrl"
            />
          </template>
          <template v-else>
            <NIcon
              size="80"
              depth="3"
              :component="UserAvatarIcon"
            />
          </template>
        </NUpload>
      </NFormItem>

      <NFormItem
        path="name"
        :label="t('TEMP.User.Name')"
      >
        <NInput
          v-model:value="formData.name"
          :placeholder="t('TEMP.Validation.Name')"
          maxlength="20"
          show-count
          clearable
        />
      </NFormItem>

      <NFormItem
        path="nickName"
        :label="t('TEMP.User.NickName')"
      >
        <NInput
          v-model:value="formData.nickName"
          :placeholder="t('TEMP.Validation.nickName')"
          maxlength="20"
          show-count
          clearable
        />
      </NFormItem>

<!--      <NFormItem-->
<!--        path="lastName"-->
<!--        :label="t('TEMP.User.LastName')"-->
<!--      >-->
<!--        <NInput-->
<!--          v-model:value="formData.lastName"-->
<!--          :placeholder="t('TEMP.Validation.LastName')"-->
<!--          maxlength="10"-->
<!--          show-count-->
<!--          clearable-->
<!--        />-->
<!--      </NFormItem>-->

      <NFormItem
        path="email"
        :label="t('TEMP.User.Email')"
      >
<!--        <NInput-->
<!--          v-model:value="formData.email"-->
<!--          :placeholder="t('TEMP.Validation.Email')"-->
<!--          maxlength="30"-->
<!--          show-count-->
<!--          clearable-->
<!--        />-->
        <n-auto-complete
          v-model:value="formData.email"
          :input-props="{
            autocomplete: 'disabled'
          }"
          :options="options"
          placeholder="邮箱"
          clearable
        />

      </NFormItem>
<!--&#45;&#45;{{formData.gender}}-->
      <NFormItem
        path="gender"
        :label="t('TEMP.User.Gender')"
      >
        <NRadioGroup
          v-model:value="formData.gender"
          :name="t('TEMP.User.Gender')"
        >
          <NSpace>
            <NRadio :value=1> {{ t('TEMP.User.Male') }} </NRadio>
            <NRadio :value=0> {{ t('TEMP.User.Female') }} </NRadio>
            <NRadio :value=2> {{ t('TEMP.User.Unknown') }} </NRadio>
          </NSpace>
        </NRadioGroup>
      </NFormItem>

      <NFormItem
        path="phoneNumber"
        :label="t('TEMP.User.PhoneNumber')"
      >
        <NInput
          v-model:value="formData.phoneNumber"
          :placeholder="t('TEMP.Validation.PhoneNumber')"
          maxlength="20"
          show-count
          clearable
        />
      </NFormItem>

      <NFormItem
        path="birthDate"
        :label="t('TEMP.User.BirthDate')"
      >
        <NDatePicker
          v-model:formatted-value="formData.birthDate"
          clearable
        />
      </NFormItem>

      <NFormItem
        path="address"
        :label="t('TEMP.User.Address')"
      >
        <NInput
          v-model:value="formData.address"
          :placeholder="t('TEMP.Validation.Address')"
          maxlength="30"
          show-count
          clearable
        />
      </NFormItem>

      <NFormItem
        path="biography"
        :label="t('TEMP.User.Biography')"
      >
        <NInput
          v-model:value="formData.biography"
          :placeholder="t('TEMP.Validation.Biography')"
          maxlength="300"
          type="textarea"
          show-count
          clearable
        />
      </NFormItem>
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
