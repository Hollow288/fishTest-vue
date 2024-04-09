<script setup lang="ts">
import 'vue-cropper/dist/index.css'

import type {FormInst, FormRules, FormValidationError} from 'naive-ui'
import { VueCropper } from 'vue-cropper'

import type {MessageSchema} from '@/types'
import type {CabinetQuotation} from '@/types/api/cabinetQuotation'
import CreateIcon from '~icons/ic/sharp-add'
import EditIcon from '~icons/ic/sharp-edit'
import ViewIcon from '~icons/mdi/file-search-outline'

export interface Props {
  portFolioFormData?: CabinetQuotation
  portFolioState: string
}

const props = defineProps<Props>()

const option =   {
    img: 'https://avatars2.githubusercontent.com/u/15681693?s=460&v=4',
    size: 1,
    full: false,
    outputType: 'png',
    canMove: false,
    fixedBox: false,
    original: false,
    canMoveBox: true,
    autoCrop: true,
    // 只有自动截图开启 宽度高度才生效
    autoCropWidth: 160,
    autoCropHeight: 150,
    centerBox: true,
    high: true,
    max: 99999,
    fixed: true,
    fixedNumber: [1, 2],
  }

const emit = defineEmits<{
  (e: 'save'): void
}>()

const {t} = useI18n<{ message: MessageSchema }>()

const NMessage = useMessage()
const [submitLoading, submitLoadingDispatcher] = useLoading()

const formRef = ref<FormInst | null>(null)
const formData = ref<CabinetQuotation>({})



const showModal = ref(false)



const quotationRules: FormRules = {
  customerName: [
    {
      required: true,
      trigger: ['blur', 'input'],
      message: () => t('TEMP.Validation.customerName'),
      renderMessage: () => t('TEMP.Validation.customerName')
    }
  ],
  telephone: [
    {
      required: true,
      trigger: ['blur', 'input'],
      message: () => t('TEMP.Validation.telephone'),
      renderMessage: () => t('TEMP.Validation.telephone')
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


  if (props.portFolioState === 'create') {
    try {



    } catch (err: any) {
      if (err.message) {
        NMessage.error(err.message)
      }
    }
  } else if (props.portFolioState === 'edit') {
    try {

      if (200) {
        NMessage.success(updateMessage!)
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
    class: 'space-x-3 flex justify-center',
    style: 'margin-top: 5px'
  }, props.portFolioState === 'view' ? [
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
      )
    ] :
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
  () => props.portFolioFormData,
  async (newValue) => {
    if (props.portFolioState === 'create') {
    } else if (props.portFolioState === 'edit') {

    } else {
    }
  },
  {immediate: true,}
)




onMounted(() => {
  // detailData.value = []
  // fileListRef.value = []
  // willRemoveAttachs.value = []
  // debugger
})

defineExpose({
  handleShowModal
})
</script>

<template>
  <NModal
    v-model:show="showModal"
    class="!my-6 sm:!w-[1200px]"
    preset="dialog"
    :title="portFolioState === 'create' ? t('TEMP.Cabinet.PortfolioWeb.create') : (portFolioState === 'edit' ? t('TEMP.PortfolioWeb.Quotation.edit') : (portFolioState === 'view' ? t('TEMP.Cabinet.PortfolioWeb.view') : t('TEMP.Cabinet.PortfolioWeb.view')))"
    :loading="submitLoading"
    :action="actonTest"
    :mask-closable="false"
  >
    <template #icon>
      <NIcon
        size="24"
        :component="portFolioState === 'create' ? CreateIcon : (portFolioState === 'edit' ? EditIcon : ViewIcon)"
      />
    </template>





    <NForm
      ref="formRef"
      :model="formData"
      :rules="quotationRules"
      label-width="auto"
      require-mark-placement="right-hanging"
      class="flex flex-col sm:!h-[630px]"
      label-placement='left'
      style="overflow-y: auto;"
      label-align='right'
    >
<!--      <div class="cropper">-->
<!--        <VueCropper-->
<!--          ref="cropper"-->
<!--          :img="option.img"-->
<!--          :output-size="option.size"-->
<!--          :output-type="option.outputType"-->
<!--        ></VueCropper>-->
<!--      </div>-->


    </NForm>


  </NModal>
</template>

<style scoped>


.custom-table {
  max-height: 200px; /* 设置最大高度 */
  overflow-y: auto; /* 垂直方向出现滚动条 */
}

.custom-table thead th {
  position: sticky;
  top: 0; /* 固定在顶部 */
  z-index: 1; /* 提升层级，防止被内容覆盖 */
}


/* 设置滚动条的宽度和颜色 */
::-webkit-scrollbar {
  width: 8px; /* 宽度 */
}

/* 滚动条轨道 */
::-webkit-scrollbar-track {
  background-color: #f1f1f1; /* 轨道背景色 */
}

/* 滚动条滑块 */
::-webkit-scrollbar-thumb {
  background-color: rgba(85, 85, 85, 0.4); /* 滑块颜色 */
  border-radius: 6px; /* 滑块圆角 */
}

/* 滚动条滑块悬停样式 */
::-webkit-scrollbar-thumb:hover {
  background-color: rgba(85, 85, 85, 0.3); /* 悬停时滑块颜色 */
}

.cropper {
  width: 260px;
  height: 260px;
}
</style>

