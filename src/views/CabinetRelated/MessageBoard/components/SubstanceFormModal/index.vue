<script setup lang="ts">
import type {FormInst} from 'naive-ui'

import type {MessageSchema } from '@/types'
import type {MessageBoard} from '@/types/api/messageBoard'
import EditIcon from '~icons/ic/sharp-edit'

export interface Props {
  substanceFormData?: MessageBoard
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'save'): void
}>()

const { t } = useI18n<{ message: MessageSchema }>()

const formRef = ref<FormInst | null>(null)
const formData = ref<MessageBoard>({})

const showModal = ref(false)

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
  () => props.substanceFormData,
  (newValue:MessageBoard) => {
    formData.value = {
      ...newValue,
      ...(newValue.messageDate && {
        messageDate: TimeUtils.formatTime(newValue.messageDate, 'YYYY-MM-DD')
      }),
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
    class="!my-6 sm:!w-[800px]"
    preset="dialog"
    :title="t('TEMP.NoticeManagement.EditNotice')"
    :negative-text="t('COMMON.Cancel')"
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
      :model="formData"
      label-width="auto"
      require-mark-placement="right-hanging"
      class="flex flex-col"
    >

      <nGrid :cols="24" :x-gap="24">
        <NFormItemGi
          :span="12"
          path="name"
          :label="t('TEMP.Cabinet.MessageBoard.name')"
        >
          <NInput
            v-model:value="formData.name"
            readonly
          />

        </NFormItemGi>

        <NFormItemGi
          :span="12"
          path="phone"
          :label="t('TEMP.Cabinet.MessageBoard.phone')"
        >
          <NInput
            v-model:value="formData.phone"
            readonly
          />

        </NFormItemGi>
      </nGrid>

      <nGrid :cols="24" :x-gap="24">
        <NFormItemGi
          :span="12"
          path="email"
          :label="t('TEMP.Cabinet.MessageBoard.email')"
        >
          <NInput
            v-model:value="formData.email"
            readonly
          />

        </NFormItemGi>
        <NFormItemGi
          :span="12"
          path="messageDate"
          :label="t('TEMP.Cabinet.MessageBoard.messageDate')"
        >

<!--          <n-date-picker v-model:formatted-value="formData.messageDate" type="date" style="width: 100%" disabled/>-->
          <NInput
            v-model:value="formData.messageDate"
            readonly
          />
        </NFormItemGi>
      </nGrid>

      <nGrid :cols="24" :x-gap="24">
        <NFormItemGi
          :span="24"
          path="message"
          :label="t('TEMP.Cabinet.MessageBoard.message')"
        >
          <NInput
            v-model:value="formData.message"
            type="textarea"
            readonly
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
