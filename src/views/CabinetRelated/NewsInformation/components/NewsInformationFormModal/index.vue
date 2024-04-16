<script setup lang="ts">

import '@wangeditor/editor/dist/css/style.css' // 引入 css

import {Editor, Toolbar} from '@wangeditor/editor-for-vue'
import type {FormInst, FormValidationError,UploadFileInfo} from 'naive-ui'
import {onBeforeUnmount,ref, shallowRef} from 'vue'

import {CabinetRelatedAPI} from '@/api/cabinetRelated'
import type {MessageSchema} from '@/types'
import type {NewsInformation} from '@/types/api/newsInformation'
import CreateIcon from '~icons/ic/sharp-add'
import EditIcon from '~icons/ic/sharp-edit'

const {t} = useI18n<{ message: MessageSchema }>()
const formRef = ref<FormInst | null>(null)
const [submitLoading, submitLoadingDispatcher] = useLoading()
const fileList = ref<UploadFileInfo[]>([])
export interface Props {
  newsInformationFormData?: NewsInformation
  isEdit: boolean
}

const props = defineProps<Props>()

const fileRef = ref([])

const NMessage = useMessage()

const emit = defineEmits<{
  (e: 'save'): void
}>()

const showModal = ref(false)

// 是否修改了附件
const isEditNewsCover = ref(false)

const handleShowModal = () => {
  showModal.value = true
  emit('save')
}

defineExpose({
  handleShowModal
})

const formData = ref<NewsInformation>({})


// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()

// // 模拟 ajax 异步获取内容
// onMounted(() => {
//   setTimeout(() => {
//     valueHtml.value = '<p>模拟 Ajax 异步设置内容</p>'
//   }, 1500)
// })

const toolbarConfig = {}
const editorConfig = {placeholder: '在这里输入正文，不需要设置字体...'}
const valueHtml = ref('')

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

const handleCreated = (editor) => {
  editorRef.value = editor // 记录 editor 实例，重要！
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


const uploadUrl = (options: { fileList: UploadFileInfo[] }) => {
  const files = options.fileList.map(item => item.file)
  fileRef.value = files
}

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

const onRemove = (options: { file: UploadFileInfo, fileList: Array<UploadFileInfo> }) => {
  isEditNewsCover.value = true
  fileList.value = []
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
    try {

      formData.value.newsText = valueHtml.value
      const {
        code: updateCode,
        message: updateMessage
      } = await CabinetRelatedAPI.editNewsInformation(formData.value)
      if(updateCode == 200){
        if(isEditNewsCover.value){
          const fileData = new FormData()
          fileRef.value.filter(file => file !== null).forEach(file => {
            fileData.append('file', file)
          })
          const {code: uploadCode} = await UploadAPI.uploadNewsInformationFile(fileData, formData.value.newsId)
          if(uploadCode == 200){
            NMessage.success(updateMessage!)
            showModal.value = false
            emit('save')
          }else{
            NMessage.error('服务器异常')
          }
        }else{
          NMessage.success(updateMessage!)
          showModal.value = false
          emit('save')
        }
      }else {
        NMessage.error('服务器异常')
      }

    } catch (err: any) {
      if (err.message) {
        NMessage.error(err.message)
      }
    }
  } else {
    try {
      formData.value.newsText = valueHtml.value
      const {
        data: createData,
        code: createCode,
        message: createMessage
      } = await CabinetRelatedAPI.addNewsInformation(formData.value)
      if(createCode == 200){
        if (fileRef.value.filter(file => file !== null).length > 0) {
          const fileData = new FormData()
          fileRef.value.filter(file => file !== null).forEach(file => {
            fileData.append('file', file)
          })
          const {code: uploadCode} = await UploadAPI.uploadNewsInformationFile(fileData, createData)

          if (createCode == 200 && uploadCode == 200)
            NMessage.success(createMessage!)
            showModal.value = false
            emit('save')
        }else {
          NMessage.error('服务器异常')
        }

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

watch(
  () => props.newsInformationFormData,
  async (newValue) => {
    if (props.isEdit) {
      formData.value = {
        ...newValue
      }
      valueHtml.value = newValue.newsText
      isEditNewsCover.value = false
      fileList.value = [
        {
          url:newValue.newsCover,
          status: 'finished'
        }
      ]
    }else{
      formData.value = {}
      valueHtml.value = ''
      isEditNewsCover.value = false
    }
  },
  {immediate: true,}
)
</script>

<template>
  <NModal
    v-model:show="showModal"
    class="!my-6 sm:!w-[1450px]"
    preset="dialog"
    :title="isEdit ? t('TEMP.Cabinet.NewsInformation.edit') : t('TEMP.Cabinet.NewsInformation.create')"
    :action="actonTest"
    :mask-closable="false"
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
      label-width="auto"
      require-mark-placement="right-hanging"
      label-placement='left'
      class="flex flex-col"
      style="overflow-y: auto;"
      label-align='right'
    >

      <nGrid :cols="24">
        <NFormItemGi
          :span="15"
          :label="t('TEMP.Cabinet.NewsInformation.newsTitle')"
        >
          <NInput
            v-model:value="formData.newsTitle"
            :placeholder="t('TEMP.Cabinet.NewsInformation.newsTitle')"
            maxlength="15"
            show-count
            clearable>

          </NInput>

        </NFormItemGi>

        <NFormItemGi
          :span="5"
          :label="t('TEMP.Cabinet.NewsInformation.newsDate')"
        >
          <n-date-picker v-model:formatted-value="formData.newsDate" type="date" />

        </NFormItemGi>

        <NFormItemGi
          :span="4"
          :label="t('TEMP.Cabinet.NewsInformation.newsCover')"
        >
          <n-upload
            v-model:file-list="fileList"
            list-type="image-card"
            max="1"
            @change="uploadUrl"
            @remove="onRemove"
            @before-upload="beforeUpload"
          >

            点击上传
          </n-upload>

        </NFormItemGi>


      </nGrid>

      <nGrid :cols="24">
        <NFormItemGi
          :span="24"
          :label="t('TEMP.Cabinet.NewsInformation.newsIntroduction')"
        >
          <NInput
            v-model:value="formData.newsIntroduction"
            :placeholder="t('TEMP.Cabinet.NewsInformation.newsIntroduction')"
            maxlength="30"
            show-count
            clearable>

          </NInput>

        </NFormItemGi>
      </nGrid>

    </NForm>
    <NForm
      v-else
      ref="formRef"
      :model="formData"
      label-width="auto"
      require-mark-placement="right-hanging"
      label-placement='left'
      class="flex flex-col"
      style="overflow-y: auto;"
      label-align='right'
    >

      <nGrid :cols="24">
        <NFormItemGi
          :span="15"
          :label="t('TEMP.Cabinet.NewsInformation.newsTitle')"
        >
          <NInput
            v-model:value="formData.newsTitle"
            :placeholder="t('TEMP.Cabinet.NewsInformation.newsTitle')"
            maxlength="15"
            show-count
            clearable>

          </NInput>

        </NFormItemGi>

        <NFormItemGi
          :span="5"
          :label="t('TEMP.Cabinet.NewsInformation.newsDate')"
        >
          <n-date-picker v-model:formatted-value="formData.newsDate" type="date" />

        </NFormItemGi>

        <NFormItemGi
          :span="4"
          :label="t('TEMP.Cabinet.NewsInformation.newsCover')"
        >
          <n-upload
            list-type="image-card"
            max="1"
            @change="uploadUrl"
            @before-upload="beforeUpload"
          >

            点击上传
          </n-upload>

        </NFormItemGi>


      </nGrid>

      <nGrid :cols="24">
        <NFormItemGi
          :span="24"
          :label="t('TEMP.Cabinet.NewsInformation.newsIntroduction')"
        >
          <NInput
            v-model:value="formData.newsIntroduction"
            :placeholder="t('TEMP.Cabinet.NewsInformation.newsIntroduction')"
            maxlength="30"
            show-count
            clearable>

          </NInput>

        </NFormItemGi>
      </nGrid>

    </NForm>
    <n-gradient-text type="info" style="font-size: 16px ; margin-top: -10px">
      正文：
    </n-gradient-text>
    <div style="border: 1px solid #ccc; margin-top: 10px">
      <Toolbar
        style="border-bottom: 1px solid #ccc"
        :editor="editorRef"
        :default-config="toolbarConfig"
        mode="default"
      />
      <Editor
        v-model="valueHtml"
        style="height: 500px; overflow-y: hidden;"
        :default-config="editorConfig"
        mode="default"
        @on-created="handleCreated"
      />
    </div>


  </NModal>
</template>

