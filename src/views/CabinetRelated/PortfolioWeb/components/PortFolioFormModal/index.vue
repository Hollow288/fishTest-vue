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
import { VueCropper }  from "vue-cropper";
import 'vue-cropper/dist/index.css'

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

let option = reactive({
  img: 'file:///C:/Users/11/Desktop/%E4%BC%81%E4%B8%9A%E5%BE%AE%E4%BF%A1%E6%88%AA%E5%9B%BE_20240411174723.png', // 裁剪图片的地址 url 地址, base64, blob
  outputSize: 1, // 裁剪生成图片的质量
  outputType: 'jpeg', // 裁剪生成图片的格式 jpeg, png, webp
  info: true, // 裁剪框的大小信息
  canScale: false, // 图片是否允许滚轮缩放
  autoCrop: true, // 是否默认生成截图框
  autoCropWidth: 150, // 默认生成截图框宽度
  autoCropHeight: 150, // 默认生成截图框高度
  fixedBox: false, // 固定截图框大小 不允许改变
  fixed: false, // 是否开启截图框宽高固定比例，这个如果设置为true，截图框会是固定比例缩放的，如果设置为false，则截图框的狂宽高比例就不固定了
  fixedNumber: [1, 1], // 截图框的宽高比例 [ 宽度 , 高度 ]
  canMove: true, // 上传图片是否可以移动
  canMoveBox: true, // 截图框能否拖动
  original: false, // 上传图片按照原始比例渲染
  centerBox: true, // 截图框是否被限制在图片里面
  infoTrue: true, // true 为展示真实输出图片宽高 false 展示看到的截图框宽高
  full: true, // 是否输出原图比例的截图
  enlarge: '1', // 图片根据截图框输出比例倍数
  mode: 'contain' // 图片默认渲染方式 contain , cover, 100px, 100% auto
})

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
      let temFormData = {typeIds: []}
      if (formData.value.photoTypes !== undefined) {
        temFormData.typeIds = generalOptions.value
          .filter(option => formData.value.photoTypes?.includes(option.value))
          .map(option => option.typeId.toString())
      }

      const {code, data} = await CabinetRelatedAPI.addPortfolio(temFormData)

      if (code == 200) {
        if (fileThumbnailRef.value.filter(file => file !== null).length > 0) {
          const fileThumbnailData = new FormData()
          fileThumbnailRef.value.filter(file => file !== null).forEach(file => {
            fileThumbnailData.append('file', file)
          })
          const {code: uploadThumbnailCode} = await UploadAPI.uploadPortFolioThumbnailFile(fileThumbnailData, data)
        }
        if (filePanoramaRef.value.filter(file => file !== null).length > 0) {
          const filePanoramaData = new FormData()
          filePanoramaRef.value.filter(file => file !== null).forEach(file => {
            filePanoramaData.append('file', file)
          })
          const {code: uploadPanoramaCode} = await UploadAPI.uploadPortFolioPanoramaFile(filePanoramaData, data)
        }
        NMessage.success("操作成功")
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
      console.log(generalOptions.value)
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
    :title="portFolioState === 'create' ? t('TEMP.Cabinet.PortfolioWeb.create') : t('TEMP.PortfolioWeb.Quotation.edit')"
    :loading="submitLoading"
    :action="actonTest"
    :mask-closable="false"
  >
    <template #icon>
      <NIcon
        size="24"
        :component="portFolioState === 'create' ? CreateIcon : EditIcon"
      />
    </template>

    <NForm
      ref="formRef"
      :model="formData"
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
          <n-button icon-placement="left" secondary @click="openAdjustModal">
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
          <n-select v-model:value="formData.photoTypes" multiple :options="generalOptions"/>

        </NFormItemGi>
      </nGrid>

    </NForm>

    <!--    这里不做修改了,感觉界面很简单,错了就删除重新加-->


  </NModal>


  <NModal
    v-model:show="showAdjustModal"
    title="裁剪图片"
    :bordered="false"
    size="huge"
    style="width: 1000px; height: 800px;"
    preset="dialog"
    aria-modal="true"
    :icon="renderIcon"
  >
<!--    <nGrid >-->
    <div style="width: 600px; height: 500px;">
        <div style="width: 100%; height: 100%;">
          <VueCropper style="width: 100%; height: 100%;" ref="cropper"
                      :img="option.img"
                      :outputSize="option.outputSize"
                      :outputType="option.outputType"
                      :info="option.info"
                      :canScale="option.canScale"
                      :autoCrop="option.autoCrop"
                      :autoCropWidth="option.autoCropWidth"
                      :autoCropHeight="option.autoCropHeight"
                      :fixedBox="option.fixedBox"
                      :fixed="option.fixed"
                      :fixedNumber="option.fixedNumber"
                      :canMove="option.canMove"
                      :canMoveBox="option.canMoveBox"
                      :original="option.original"
                      :centerBox="option.centerBox"
                      :infoTrue="option.infoTrue"
                      :full="option.full"
                      :enlarge="option.enlarge"
                      :mode="option.mode">
          </VueCropper>
        </div>
    </div>
<!--    </nGrid>-->
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

