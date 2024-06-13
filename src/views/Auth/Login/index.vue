<script setup lang="ts">
import type {FormInst, FormRules, FormValidationError} from 'naive-ui'
import Vcode from 'vue3-puzzle-vcode'

import {StatusCode} from '@/constants'
import type { MessageSchema } from '@/types'

import { GitHubLogin, GoogleLogin } from './components'
import type { RememberedAccountData } from './private'

const { t } = useI18n<{ message: MessageSchema }>()

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const NMessage = useMessage()

const isShow = ref(false)

const [submitLoading, submitLoadingDispatcher] = useLoading(false)

const submitType = ref<'BASIC' | 'ADMIN'>('BASIC')

const formData = reactive({
  userName: '',
  passWord: ''
})
const formRef = ref<FormInst | null>(null)
const rememberPassword = ref(false)

const redirectUrl = computed(() => route.query.redirect as string)

const success = (msg) => {
  isShow.value = false
  submitType.value = 'BASIC'
  login()
}

const fail = () => {
  // console.log('验证失败')
}

const close = () => {
  isShow.value = false
}

const rules: FormRules = {
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
    // {
    //   validator: (_: FormItemRule, value: string) => value.length >= 6,
    //   trigger: ['blur', 'input'],
    //   message: () => t('TEMP.Validation.PasswordLength'),
    //   renderMessage: () => t('TEMP.Validation.PasswordLength')
    // }
  ]
}

/**
 * 登录
 */
const login = async () => {
  try {
    await formRef.value!.validate()
  } catch (errors) {
    const errorMessage = (errors as FormValidationError[])[0][0].message
    if (errorMessage) {
      NMessage.error(errorMessage)
    }
    return
  }

  if (submitLoading.value) {
    return
  }

  submitLoadingDispatcher.loading()

  AuthAPI.login(formData)
    .then((res) => {
      // debugger
      if(res.code === StatusCode.SUCCESS) {
        const { access_token, refresh_token, user } = res.data ?? {}
        AuthUtils.setAccessToken(access_token)
        AuthUtils.setRefreshToken(refresh_token)
        let userObject
        if (typeof user === 'string') {
          userObject = JSON.parse(user)
        } else {
          userObject = user
        }
        userStore.setUser(userObject)
        if (res.message) {
          NMessage.success(res.message)
        }
        if (rememberPassword.value) {
          AuthUtils.setRememberedAccount(JSON.stringify(formData))
        } else {
          AuthUtils.clearRememberedAccount()
        }

        if (redirectUrl.value) {
          router.replace(redirectUrl.value)
        } else {
          router.replace('/')
        }
      }else {
          NMessage.error(res.message || '登录失败')
          submitLoadingDispatcher.loaded()
          formData.passWord = ''
      }

    })
    .catch((err) => {
      if (err.message) {
        NMessage.error(err.message)
      }
      submitLoadingDispatcher.loaded()
      formData.passWord = ''
    })
}

/**
 * 基础登录
 */
const loginAsBasic = () => {
  // submitType.value = 'BASIC'
  // login()
  isShow.value = true
}

/**
 * 以管理员身份登录
 */
const loginAsAdmin = () => {
  submitType.value = 'ADMIN'
  formData.userName = AuthUtils.DEFAULT_ADMIN_USERNAME
  formData.passWord = AuthUtils.DEFAULT_ADMIN_PASSWORD
  login()
}

/**
 * 忘记密码
 */
const forgetPassword = () => {}

onMounted(() => {
  // 从 localStorage 中获取记住的账号密码
  const localStorageData = AuthUtils.getRememberedAccount()
  if (localStorageData) {
    try {
      const { userName, passWord } = JSON.parse(localStorageData) as RememberedAccountData
      formData.userName = userName
      formData.passWord = passWord
      rememberPassword.value = true
    } catch {
      //
    }
  }
})
</script>

<template>
  <NForm
    ref="formRef"
    :rules="rules"
    :model="formData"
    :disabled="submitLoading"
    class="absolute inset-0 m-auto flex h-fit w-[340px] max-w-[85%] flex-col space-y-4 rounded-lg bg-default-light px-4 py-8 shadow-md transition-colors dark:bg-default-dark sm:w-[260px] md:w-[340px]"
  >
    <div class="text-center text-lg font-semibold">
      {{ t('TEMP.Login.Login') }}
    </div>

    <NFormItem
      path="userName"
      :show-label="false"
      :show-feedback="false"
    >
      <NInput
        v-model:value="formData.userName"
        type="text"
        :placeholder="t('TEMP.User.Username')"
        :input-props="{ autocomplete: 'userName' }"
        @keyup.enter="loginAsBasic"
      />
    </NFormItem>

    <NFormItem
      path="passWord"
      :show-label="false"
      :show-feedback="false"
    >
      <NInput
        v-model:value="formData.passWord"
        type="password"
        show-password-on="click"
        :placeholder="t('TEMP.User.Password')"
        :maxlength="16"
        :input-props="{ autocomplete: 'current-password' }"
        @keyup.enter="loginAsBasic"
      />
    </NFormItem>



    <div class="text-grey-300 flex items-center justify-between text-xs font-light">
      <NCheckbox
        v-model:checked="rememberPassword"
        size="small"
        class="!text-xs"
        :disabled="submitLoading"
      >
        {{ t('TEMP.Login.RememberPassword') }}
      </NCheckbox>
      <div

        class="cursor-pointer hover:text-blue-600"
        @click="forgetPassword"
      >
        {{ t('TEMP.Login.ForgetPassword') }}
      </div>
    </div>

    <div class="flex w-full flex-1 items-center space-x-2">
      <NButton
        class="!w-[calc(100%)]"
        type="primary"
        :disabled="submitLoading"
        :loading="submitType === 'BASIC' && submitLoading"
        @click="loginAsBasic"
      >
        {{ t('TEMP.Login.Login') }}
      </NButton>
<!--      <NButton-->
<!--        class="!w-[calc(50%-4px)]"-->
<!--        secondary-->
<!--        type="primary"-->
<!--        :disabled="submitLoading"-->
<!--        :loading="submitType === 'ADMIN' && submitLoading"-->
<!--        @click="loginAsAdmin"-->
<!--      >-->
<!--        {{ t('TEMP.Login.AsAdmin') }}-->
<!--      </NButton>-->
    </div>

    <div class="flex items-center space-x-1 text-xs">
      <span>{{ t('TEMP.Login.NeedAccount') }}</span>
      <NButton
        type="primary"
        text
        @click="() => router.push('/signup')"
      >
        <span class="text-xs font-semibold underline-offset-4 hover:underline">
          {{ t('TEMP.Login.Signup') }}
        </span>
      </NButton>
    </div>

    <NDivider>
      <span class="text-xs">{{ t('TEMP.Login.ThirdPartyLogin') }}</span>
    </NDivider>

    <div class="flex flex-col space-y-2">
      <GitHubLogin />
      <GoogleLogin />
    </div>
  </NForm>

  <Vcode :show="isShow" @success="success" @close="close" @fail="fail"
  ></Vcode>
</template>

<style scoped lang="scss">
:deep(.n-checkbox__label) {
  padding: 0 6px;
}
</style>
