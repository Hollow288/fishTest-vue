<script setup lang="ts">


import type {FormInst, FormRules, FormValidationError} from 'naive-ui'
import {NIcon, UploadFileInfo} from 'naive-ui'

import {CabinetRelatedAPI} from '@/api/cabinetRelated'
import type {MessageSchema} from '@/types'
import type {CabinetQuotation} from '@/types/api/cabinetQuotation'
import type {PortFolioType} from '@/types/api/portFolioType'
import CreateIcon from '~icons/ic/sharp-add'
import EditIcon from '~icons/ic/sharp-edit'
import ViewIcon from '~icons/mdi/file-search-outline'
import SettingsAdjust from '~icons/mdi/image-auto-adjust'
import {PortFolio} from "@/types/api/cortFolio";

export interface Props {
  portFolioFormData?: CabinetQuotation
  portFolioState: string
}

const props = defineProps<Props>()
const generalOptions = ref<PortFolioType>([])
const fileThumbnailRef = ref([])
const filePanoramaRef = ref([])
const formData = ref<PortFolio>({})

const uploadThumbnailUrl = (options: { fileList: UploadFileInfo[] }) => {
  const files = options.fileList.map(item => item.file)
  fileThumbnailRef.value = files
}

const uploadPanoramaUrl = (options: { fileList: UploadFileInfo[] }) => {
  const files = options.fileList.map(item => item.file)
  filePanoramaRef.value = files
}

const emit = defineEmits<{
  (e: 'save'): void
}>()

const {t} = useI18n<{ message: MessageSchema }>()

const NMessage = useMessage()
const [submitLoading, submitLoadingDispatcher] = useLoading()

const formRef = ref<FormInst | null>(null)

const showModal = ref(false)
const showAdjustModal = ref(false)


const openAdjustModal = () => {
  showAdjustModal.value = true
}

const renderIcon = () => h(NIcon, null, {
    default: () => h(SettingsAdjust)
  })

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

       const {code,data} =  await CabinetRelatedAPI.addPortfolio(formData.value)

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
      const {data} = await CabinetRelatedAPI.getPortFolioType()
      generalOptions.value = data
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
    class="!my-6 sm:!w-[800px]"
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
      label-placement='left'
      style="overflow-y: auto;"
      label-align='right'
    >

      <nGrid :cols="24">
        <NFormItemGi
          :span="7"
          :label="t('TEMP.Cabinet.PortfolioWeb.thumbnail')"
        >
            <n-upload
              list-type="image-card"
              max="1"
              @change="uploadThumbnailUrl"
            >
              点击上传
            </n-upload>
        </NFormItemGi>
        <n-gi span="5">
          <n-button icon-placement="left" secondary  @click="openAdjustModal">
            <template #icon>
              <n-icon :component="SettingsAdjust">
                <!--                <AddSharp-icon />-->
              </n-icon>
            </template>
            {{ t('COMMON.SettingsAdjust') }}
          </n-button>
        </n-gi>

        <NFormItemGi
          :span="12"
          :label="t('TEMP.Cabinet.PortfolioWeb.Panorama')"
        >
          <n-upload
            list-type="image-card"
            max="1"
            @change="uploadPanoramaUrl"
          >
            点击上传
          </n-upload>
        </NFormItemGi>

      </nGrid>



      <nGrid :cols="24">
        <NFormItemGi
          :span="24"
          :label="t('TEMP.Cabinet.PortfolioWeb.photoType')"
        >
          <n-select v-model:value="formData.photoTypes" multiple :options="generalOptions" />

        </NFormItemGi>
      </nGrid>

    </NForm>



  </NModal>

  <NModal
    title="裁剪图片"
    :bordered="false"
    size="huge"
    preset="dialog"
    aria-modal="true"
    @change="uploadThumbnailUrl"
    :icon="renderIcon">

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
  height: 360px;
}
</style>

