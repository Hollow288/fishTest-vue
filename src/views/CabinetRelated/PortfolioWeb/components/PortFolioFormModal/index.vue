<script setup lang="ts">


import type {FormInst, FormRules, FormValidationError} from 'naive-ui'
import {NIcon, UploadFileInfo} from 'naive-ui'

import {CabinetRelatedAPI} from '@/api/cabinetRelated'
import type {MessageSchema} from '@/types'
import type {CabinetQuotation} from '@/types/api/cabinetQuotation'
import type {PortFolioType} from '@/types/api/portFolioType'
import CreateIcon from '~icons/ic/sharp-add'
import EditIcon from '~icons/ic/sharp-edit'
import PlusIcon from '~icons/mdi/plus-thick'
import MinusIcon from '~icons/mdi/minus-thick'
import LeftIcon from '~icons/mdi/restore'
import RightIcon from '~icons/mdi/reload'
import SettingsAdjust from '~icons/mdi/image-auto-adjust'
import PreviewIcon from '~icons/mdi/cube-scan'
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


const fileList = ref<UploadFileInfo[]>([])

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
const cropper = ref()
const imgUrl = ref('')


const openAdjustModal = () => {
  const reader = new FileReader()
  reader.readAsDataURL(fileThumbnailRef.value[0])
  reader.onload = () => {
    option.img = reader.result
  }
  showAdjustModal.value = true
}

const renderIcon = () => h(NIcon, null, {
  default: () => h(SettingsAdjust)
})

let option = reactive({
  img: '', // 裁剪图片的地址 url 地址, base64, blob
  outputSize: 1, // 裁剪生成图片的质量
  outputType: 'jpeg', // 裁剪生成图片的格式 jpeg, png, webp
  info: true, // 裁剪框的大小信息
  canScale: false, // 图片是否允许滚轮缩放
  autoCrop: true, // 是否默认生成截图框
  autoCropWidth: 150, // 默认生成截图框宽度
  autoCropHeight: 150, // 默认生成截图框高度
  fixedBox: false, // 固定截图框大小 不允许改变
  fixed: true, // 是否开启截图框宽高固定比例，这个如果设置为true，截图框会是固定比例缩放的，如果设置为false，则截图框的狂宽高比例就不固定了
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


const beforeUpload = async (data: {
  file: UploadFileInfo
  fileList: UploadFileInfo[]
}) => {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/gif'] // 允许的图片格式数组

  // 获取上传文件的 MIME 类型
  const fileType = data.file.file?.type

  // 检查文件类型是否在允许的类型数组中
  if (!allowedTypes.includes(fileType)) {
    NMessage.error('只能上传 PNG、JPEG 或 GIF 格式的图片文件，请重新上传')
    return false
  }
  return true
}

// 获取图片
const getCropDataBase64 = () => {
  // 这个是获取base64的图片
  cropper.value.getCropData((data: any) => {
    console.log(data)
    // do something
    // 如这里，可以获取上传base64位的图片给服务器
    // 也可以将base64位的图片转化为file文件，然后通过form表单的形式提交给后端，让后端返回一个图片的访问地址等
    // 这里就简单把截取到的图片展示一下吧，这里就暂时不上传给后端了
    imgUrl.value = data
  })
}


const realTime = ()=> {
  cropper.value.getCropData((data: any) => {
    imgUrl.value = data
  })
}


// 向左旋转图片
const rotateLeft = () => {
  cropper.value.rotateLeft()
}

// 向右旋转
const rotateRight = () => {
  cropper.value.rotateRight()
}

const changeScale = (num)=> {
  num = num || 1
  cropper.value.changeScale(num)
}

const ConfirmImg = ()=>{
  cropper.value.getCropBlob((data: any) => {
    fileThumbnailRef.value[0] = data
    fileList.value[0].file = data
  })

  showAdjustModal.value = false
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
  async () => {
    if (props.portFolioState === 'create') {
      const {data} = await CabinetRelatedAPI.getPortFolioType()
      generalOptions.value = data
      formData.value.photoTypes = []
      fileList.value = []
      fileThumbnailRef.value = []
      filePanoramaRef.value = []

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
            v-model:file-list="fileList"
            @before-upload="beforeUpload"
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
            @before-upload="beforeUpload"
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
    style="width: 1000px; height: 750px;"
    preset="dialog"
    aria-modal="true"
    :icon="renderIcon"
  >

    <n-gradient-text type="info" style="font-size: 16px">
      原图片：
    </n-gradient-text>
<!--    <nGrid >-->
    <div style="display: flex;">
      <div style="width: 600px; height: 500px;border: 1px solid #ccc;">
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
                      :mode="option.mode"
                      @realTime="realTime">
          </VueCropper>

        </div>
      </div>
      <div style="width: 200px; height: 500px; margin-top: 140px; margin-left: 90px;">
        <n-gradient-text type="info" style="font-size: 16px">
          裁剪后图片：
        </n-gradient-text>
        <!-- 若图片只设置宽度，可以保持等比例展示图片 -->
        <img :src="imgUrl" style="width: 100%;">
      </div>
    </div>
    <n-divider title-placement="left" style="margin-top: -120px">
      {{ t('TEMP.Cabinet.PortfolioWeb.operation') }}
    </n-divider>
    <n-space style="margin-left: 20px">
      <n-tooltip trigger="hover">
        <template #trigger>
          <NButton @click="getCropDataBase64">
            <template #icon>
              <n-icon :component="PreviewIcon">
              </n-icon>
            </template>
          </NButton>
        </template>
        {{ t('TEMP.Cabinet.PortfolioWeb.Preview') }}
      </n-tooltip>

      <n-tooltip trigger="hover">
        <template #trigger>
          <n-button icon-placement="left" type="tertiary" @click="changeScale(1)">
            <template #icon>
              <n-icon :component="PlusIcon">
              </n-icon>
            </template>
          </n-button>
        </template>
        {{ t('TEMP.Cabinet.PortfolioWeb.magnify') }}
      </n-tooltip>


      <n-tooltip trigger="hover">
        <template #trigger>
          <n-button icon-placement="left" type="tertiary" @click="changeScale(-1)">
            <template #icon>
              <n-icon :component="MinusIcon">
              </n-icon>
            </template>
          </n-button>
        </template>
        {{ t('TEMP.Cabinet.PortfolioWeb.shrink') }}
      </n-tooltip>


      <n-tooltip trigger="hover">
        <template #trigger>
          <n-button type="tertiary" @click="rotateLeft">
            <template #icon>
              <n-icon :component="LeftIcon">
              </n-icon>
            </template>
          </n-button>
        </template>
        {{ t('TEMP.Cabinet.PortfolioWeb.Left') }}
      </n-tooltip>


      <n-tooltip trigger="hover">
        <template #trigger>
          <n-button type="tertiary" @click="rotateRight">
            <template #icon>
              <n-icon :component="RightIcon">
              </n-icon>
            </template>
          </n-button>
        </template>
        {{ t('TEMP.Cabinet.PortfolioWeb.Right') }}
      </n-tooltip>


      <n-button strong secondary style="margin-left: 170px" @click="ConfirmImg">
        {{ t('TEMP.Cabinet.PortfolioWeb.Confirm') }}
      </n-button>
      <n-button strong secondary  >
        {{ t('TEMP.Cabinet.PortfolioWeb.Cancel') }}
      </n-button>
    </n-space>



<!--    </nGrid>-->
  </NModal>


</template>

