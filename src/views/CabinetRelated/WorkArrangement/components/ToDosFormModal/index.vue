<script setup lang="ts">

import '@wangeditor/editor/dist/css/style.css' // 引入 css

import {BagOutline,PersonCircleOutline} from '@vicons/ionicons5'
import type {FormInst, FormValidationError,SelectRenderLabel, SelectRenderTag} from 'naive-ui'

import type {MessageSchema,UserRole} from '@/types'
import type {NewsInformation} from '@/types/api/newsInformation'
import EditIcon from '~icons/ic/sharp-edit'

const {t} = useI18n<{ message: MessageSchema }>()
const formRef = ref<FormInst | null>(null)
const [submitLoading, submitLoadingDispatcher] = useLoading()

export interface Props {
  year?: number
  month?: number
  date?: number
}

const props = defineProps<Props>()
const options = ref<UserRole[]>([])
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

const NMessage = useMessage()

const emit = defineEmits<{
  (e: 'save'): void
}>()

const showModal = ref(false)


const customValue =  ref([
  {
    agencyMatters: '',
    userIds:[]
  }
])

const onCreate =  () => ({
    agencyMatters: '',
    userIds:[]
  })

const chooseAll = (value) => {
  value.userIds = options.value.map(n=>n.value)
}

const handleShowModal = () => {
  showModal.value = true
  emit('save')
}

defineExpose({
  handleShowModal
})

const formData = ref<NewsInformation>({})


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


  submitLoadingDispatcher.loaded()
  return true
}


watch(
  () => props,
  async (newValue) => {
    const {data} = await UserAPI.allUserRole()
    options.value = data
    console.log(newValue.year)
    console.log(newValue.month)
    console.log(newValue.date)
  },
  { deep: true }
)

</script>

<template>
  <NModal
    v-model:show="showModal"
    class="!my-6 sm:!w-[700px]"
    preset="dialog"
    :title="t('TEMP.Cabinet.WorkArrangement.ToDos')"
    :action="actonTest"
    :mask-closable="false"
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
      label-placement='left'
      style="overflow-y: auto;"
      label-align='right'
    >

      <nGrid :cols="24">
        <NFormItemGi
          :span="24"
          path="customValue"
          :label="t('TEMP.Cabinet.WorkArrangement.OrganizationOfWork')"
        >
          <n-dynamic-input v-model:value="customValue" :on-create="onCreate">
            <template #create-button-default>
              随便搞点啥
            </template>
            <template #default="{ value }">
              <div style=" align-items: center; width: 100%">

                第{{customValue.indexOf(value)+1}}项：

                <div style="display: flex;">
                  <n-icon size="35">
                    <Person-Circle-Outline />
                  </n-icon>

                  <n-select
                    v-model:value="value.userIds"
                    multiple
                    :options="options"
                    clearable
                    :render-label="renderLabel"
                    :render-tag="renderMultipleSelectTag"
                    filterable
                  />

                  <n-button quaternary @click="chooseAll(value)">
                    全选
                  </n-button>
                </div>
                <div style="display: flex;margin-top: 5px">
                <n-icon size="35">
                  <Bag-Outline />
                </n-icon>
                <n-input v-model:value="value.agencyMatters" type="text" />
                </div>
              </div>
            </template>
          </n-dynamic-input>

        </NFormItemGi>


      </nGrid>


    </NForm>



  </NModal>
</template>

