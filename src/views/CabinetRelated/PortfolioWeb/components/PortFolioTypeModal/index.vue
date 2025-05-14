<script setup lang="ts">
import type {FormInst, FormValidationError} from 'naive-ui'

import type {MessageSchema} from '@/types'
import type {PortFolioType} from '@/types/api/portFolioType'
import CogIcon from '~icons/mdi/cog'
import {CabinetRelatedAPI} from "@/api/cabinetRelated";

export interface Props {
  portFolioTypeFormData?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'save'): void
}>()

const {t} = useI18n<{ message: MessageSchema }>()

const NMessage = useMessage()
const [submitLoading, submitLoadingDispatcher] = useLoading()

const formRef = ref<FormInst | null>(null)
const formData = ref<PortFolioType>([])
const showModal = ref(false)


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

    const obj = {formData:formData.value}

    let {code,message} = await CabinetRelatedAPI.editPortFolioType(obj)

    if (code == '200') {
      NMessage.success(message)
      showModal.value = false
      emit('save')
    } else {
      NMessage.error('服务器异常')
    }


  } catch (err: any) {
    if (err.message) {
      NMessage.error(err.message)
    }
  }

  submitLoadingDispatcher.loaded()
  return true
}

const onCreate = (label: string) => ({
    label,
    value: label + '-code'
  })


const handleCancel = () => {
  showModal.value = false
  emit('save')
}

const actonTest = () => h(
  'div',
  {
    class: 'space-x-3 flex justify-center',
    style: 'margin-top: 5px'
  },
    [
      h(
        NButton,
        {
          type: 'default',
          size: 'small',
          onClick: () => {
            handleCancel()
          }
        },
        {
          default: () => t('TEMP.NoticeManagement.Cancel')
        }
      ),
      h(
        NButton,
        {
          type: 'info',
          size: 'small',
          onClick: () => {
            handleSubmit()
          }
        },
        {
          default: () => t('TEMP.NoticeManagement.Save')
        }
      )
    ]
)


/**
 * @todo 重构
 * 使用参数传递的方式，不要用 defineExpose 暴露方法给父组件
 */

const handleShowModal = () => {
  showModal.value = true
  emit('save')
}

watch(
  () => props.portFolioTypeFormData,
  async () => {
    let {data} = await CabinetRelatedAPI.getPortFolioType()
    formData.value = data
  },
  {immediate: true,}
)


defineExpose({
  handleShowModal
})
</script>

<template>
  <NModal
    v-model:show="showModal"
    class="!my-6 sm:!w-[400px]"
    preset="dialog"
    :title="t('TEMP.Cabinet.PortfolioWeb.Setting')"
    :loading="submitLoading"
    :action="actonTest"
    :mask-closable="false"
  >
    <template #icon>
      <NIcon
        size="24"
        :component="CogIcon"
      />
    </template>

    <NForm
      ref="formRef"
      :model="formData"
      label-width="auto"
      require-mark-placement="right-hanging"
      class="flex flex-col sm:!h-[120px]"
      label-placement='left'
      style="overflow-y: auto;"
      label-align='right'
    >

      <nGrid :cols="24">
        <NFormItemGi
          :span="24"
          path="customerName"
          :label="t('TEMP.Cabinet.PortfolioWeb.PortfolioType')"
        >
          <n-dynamic-tags v-model:value="formData" @create="onCreate"/>

        </NFormItemGi>



      </nGrid>


    </NForm>



  </NModal>
</template>

