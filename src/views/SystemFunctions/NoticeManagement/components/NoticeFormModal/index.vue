<script setup lang="ts">
import type {FormInst, FormRules, FormValidationError ,SelectRenderLabel, SelectRenderTag} from 'naive-ui'

import type { Menu,MessageSchema, User ,UserRole} from '@/types'
import CreateIcon from '~icons/ic/sharp-add'
import EditIcon from '~icons/ic/sharp-edit'

export interface Props {
  noticeFormData?: Menu
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
const options = ref<UserRole[]>([])

const showModal = ref(false)

const noticeRules: FormRules = {
  userIds: [
    {
      required: true,
      type: 'array',
      trigger: ['change'],
      message: () => t('TEMP.Validation.userIds'),
      renderMessage: () => t('TEMP.Validation.userIds')
    }
  ],
  message:[
    {
      required: true,
      trigger: ['blur', 'input'],
      message: () => t('TEMP.Validation.message'),
      renderMessage: () => t('TEMP.Validation.message')
    }
  ]
}


const renderMultipleSelectTag: SelectRenderTag = ({
                                                    option,
                                                    handleClose
                                                  }) => h(
    NTag,
    {
      style: {
        padding: '0 6px 0 4px'
      },
      round: true,
      closable: true,
      onClose: (e) => {
        e.stopPropagation()
        handleClose()
      }
    },
    {
      default: () =>
        h(
          'div',
          {
            style: {
              display: 'flex',
              alignItems: 'center'
            }
          },
          [
            h(NAvatar, {
              src: option.avatarUrl,
              round: true,
              size: 22,
              style: {
                marginRight: '4px'
              }
            }),
            option.label as string
          ]
        )
    }
  )


const renderLabel: SelectRenderLabel = (option) => h(
    'div',
    {
      style: {
        display: 'flex',
        alignItems: 'center'
      }
    },
    [
      h(NAvatar, {
        src: option.avatarUrl,
        round: true,
        size: 'small'
      }),
      h(
        'div',
        {
          style: {
            marginLeft: '12px',
            padding: '4px 0'
          }
        },
        [
          h('div', null, [option.label as string])
        ]
      )
    ]
  )

const chooseAll = () => {

  if(typeof formData.value.userIds === 'undefined' || formData.value.userIds.length !== options.value.length){
    formData.value.userIds = options.value.map(n=>n.value)
  }else {
    formData.value.userIds = []
  }

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
  emit('save')
}


const actonTest = () => h(
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
    ),
    h(
      NButton,
      {
        type: 'warning',
        size: 'small',
        onClick: () => {

        }
      },
      {
        default: () => t('TEMP.NoticeManagement.Publish')
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
  () => props.noticeFormData,
  async (newValue) => {
    if (newValue &&  typeof newValue.noticeId !== 'undefined') {
      formData.value = {
        ...newValue,
      }
      const {code:code1, data:data1} = await UserAPI.allUserRole()
      const {code:code2, data:data2} = await NoticeAPI.allUsersByNoticeId(newValue.noticeId)
      options.value = data1
      formData.value.userIds = data2

    } else {
      const {data:data1} = await UserAPI.allUserRole()
      options.value = data1
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
    class="!my-6 sm:!w-[800px]"
    preset="dialog"
    :title="isEdit ? t('TEMP.NoticeManagement.EditNotice') : t('TEMP.NoticeManagement.CreateNotice')"
    :loading="submitLoading"
    :action="actonTest"
  >

    <!--    :positive-text="t('COMMON.Confirm')"-->
    <!--    :negative-text="t('COMMON.Cancel')"-->
    <!--    @positive-click="handleSubmit"-->
    <!--    @negative-click="handleCancel"-->
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
      :rules="noticeRules"
      label-width="auto"
      require-mark-placement="right-hanging"
      class="flex flex-col"
    >

      <nGrid :cols="24" >
        <NFormItemGi
          :span="24"
          path="userIds"
          :label="t('TEMP.NoticeManagement.userIds')"
        >

          <n-select
            v-model:value="formData.userIds"
            multiple
            :options="options"
            clearable
            :render-label="renderLabel"
            :render-tag="renderMultipleSelectTag"
            filterable
          />

          <!--          <n-float-button position="relative">-->
          <!--            <n-badge :value="9" :offset="[6, -8]">-->
          <!--              <n-icon>-->
          <!--                <alarm-outline-icon />-->
          <!--              </n-icon>-->
          <!--            </n-badge>-->
          <!--          </n-float-button>-->

          <n-button quaternary @click="chooseAll">
            全选
          </n-button>
        </NFormItemGi>
      </nGrid>


      <nGrid :cols="24" >
        <NFormItemGi
          :span="24"
          path="message"
          :label="t('TEMP.NoticeManagement.message')"
        >
          <n-input
            v-model:value="formData.message"
            type="textarea"
            placeholder="在这里写下你的骚扰通知"
          />
        </NFormItemGi>
      </nGrid>

    </NForm>

    <NForm
      v-else
      ref="formRef"
      :model="formData"
      :rules="noticeRules"
      label-width="auto"
      require-mark-placement="right-hanging"
      class="flex flex-col"
    >

      <nGrid :cols="24" >
        <NFormItemGi
:span="24"
                     path="userIds"
                     :label="t('TEMP.NoticeManagement.userIds')"
        >

          <n-select
            v-model:value="formData.userIds"
            multiple
            :options="options"
            clearable
            :render-label="renderLabel"
            :render-tag="renderMultipleSelectTag"
            filterable
          />

<!--          <n-float-button position="relative">-->
<!--            <n-badge :value="9" :offset="[6, -8]">-->
<!--              <n-icon>-->
<!--                <alarm-outline-icon />-->
<!--              </n-icon>-->
<!--            </n-badge>-->
<!--          </n-float-button>-->

          <n-button quaternary @click="chooseAll">
            全选
          </n-button>
        </NFormItemGi>
      </nGrid>


      <nGrid :cols="24" >
        <NFormItemGi
:span="24"
                     path="message"
                     :label="t('TEMP.NoticeManagement.message')"
        >
          <n-input
            v-model:value="formData.message"
            type="textarea"
            placeholder="在这里写下你的骚扰通知"
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
