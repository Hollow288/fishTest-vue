<script setup lang="ts">
import type {FormInst, FormRules, FormValidationError} from 'naive-ui'
import {ArchiveOutline as ArchiveIcon} from '@vicons/ionicons5'
import type {MessageSchema} from '@/types'
import EditIcon from '~icons/ic/sharp-edit'
import {OrderStatus} from "@/types/api/orderStatus";
import ViewIcon from '~icons/mdi/file-search-outline'
import CreateIcon from '~icons/ic/sharp-add'
import {UploadFileInfo} from "naive-ui";

export interface Props {
  orderFormData?: OrderStatus
  isEdit: string
}

const props = defineProps<Props>()
const fileList = ref<UploadFileInfo[]>([])
const loadingRef = ref(true)

const emit = defineEmits<{
  (e: 'save'): void
}>()

const {t} = useI18n<{ message: MessageSchema }>()

const NMessage = useMessage()
const [submitLoading, submitLoadingDispatcher] = useLoading()

const formRef = ref<FormInst | null>(null)
const formData = ref<OrderStatus>({})
const willRemoveAttachs = ref<string[]>([])
const showModal = ref(false)

const fileListRef = ref([])


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
  message: [
    {
      required: true,
      trigger: ['blur', 'input'],
      message: () => t('TEMP.Validation.message'),
      renderMessage: () => t('TEMP.Validation.message')
    }
  ]
}


const parse = (input: string) => {

  const nums = input.replace(/,/g, '').trim()
  if (/^\d+(\.(\d+)?)?$/.test(nums)) return Number(nums)
  return nums === '' ? null : Number.NaN
}

const format = (value: number | null) => {
  if (value === null) {
    return ''
  }
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
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


  if (props.isEdit  === 'create') {
    try {
      const {code : createCode,data : createData,message : createMessage} = await CabinetRelatedAPI.createOrderStatus(formData.value)

      if (createCode == 200) {
        if(fileListRef.value.length > 0){
          const fileData = new FormData()
          fileListRef.value.forEach(file => {
            fileData.append('file', file)
          })
          const {code: updateCode, message} = await UploadAPI.uploadOrderStatusFile(fileData, createData)

          if(updateCode == 200) {
            NMessage.success(message)
            showModal.value = false
            emit('save')
          } else {
            NMessage.error('服务器异常')
          }
        }else {
          NMessage.success(createMessage)
          showModal.value = false
          emit('save')
        }
      } else {
        NMessage.error(createMessage)
      }
    } catch (err: any) {
      if (err.message) {
        NMessage.error(err.message)
      }
    }
  } else {
    try {
      // 修改主表信息和子表信息
      const {
        message: updateMessage,
        code: updateCode
      } = await CabinetRelatedAPI.updateOrderStatus(formData.value, formData.value.orderId)

      // 要删除的附件
      const temObj = {ids: willRemoveAttachs.value}
      const {code: removeCode} = await CabinetRelatedAPI.removeOrderStatusAttachs(temObj)

      // 上传新的附件
      if (fileListRef.value.filter(file => file !== null).length > 0) {
        const fileData = new FormData()
        fileListRef.value.filter(file => file !== null).forEach(file => {
          fileData.append('file', file)
        })
        const {code: uploadCode} = await UploadAPI.uploadOrderStatusFile(fileData, formData.value.quotationId)
      }
      if (updateCode == 200 && removeCode == 200) {
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
    )
  ]
)


const uploadAvatarUrl = (options: { fileList: UploadFileInfo[] }) => {
  const files = options.fileList.map(item => item.file)
  fileListRef.value = files
}


const onRemove = (options: { file: UploadFileInfo, fileList: Array<UploadFileInfo> }) => {
  willRemoveAttachs.value.push(options.file.id)
}

const handleDownload = (file: UploadFileInfo) => {
  DownloadAPI.getDownloadOrderStatus(file.id).then(result => {

    const blob = new Blob([result], {type: 'application/octet-stream'})
    // 创建一个临时 URL
    const url = window.URL.createObjectURL(blob)
    // 创建一个下载链接
    const a = document.createElement('a')
    a.href = url
    a.download = file.name // 设置下载的文件名
    a.target = '_blank'
    // 触发点击事件，开始下载
    document.body.appendChild(a)
    a.click()
    // 清理临时 URL
    window.URL.revokeObjectURL(url)

    NMessage.success(`下载成功：${file.name}`)
  })


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
  () => props.orderFormData,
  async (newValue) => {
    if (props.isEdit === 'create') {
      fileListRef.value = []
      willRemoveAttachs.value = []
    }else if(props.isEdit === 'edit'){
      formData.value = {
        ...newValue
      }
      const {
        code: attachCode,
        data: attachDatas
      } = await CabinetRelatedAPI.getAttachDataByOrderId(formData.value.orderId)
      if (attachCode == 200) {
        fileList.value = attachDatas
      } else {
        NMessage.error('数据读取错误')
      }
    }
  },
  {deep: true}
)

defineExpose({
  handleShowModal
})
</script>

<template>
  <NModal
    v-model:show="showModal"
    class="!my-6 sm:!w-[1000px]"
    preset="dialog"
    :title="isEdit === 'create' ? t('TEMP.Cabinet.Quotation.create') : (isEdit === 'edit' ? t('TEMP.Cabinet.Quotation.edit') : (isEdit === 'view' ? t('TEMP.Cabinet.Quotation.view') : t('TEMP.Cabinet.Quotation.view')))"
    :loading="submitLoading"
    :action="actonTest"
  >
    <template #icon>
      <NIcon
        size="24"
        :component="isEdit === 'create' ? CreateIcon : (isEdit === 'edit' ? EditIcon : ViewIcon)"
      />
    </template>

    <NForm
      v-if="isEdit === 'create'"
      ref="formRef"
      :model="formData"
      :rules="noticeRules"
      label-width="auto"
      require-mark-placement="right-hanging"
      class="flex flex-col"
      label-placement="left"
    >
      <nGrid :cols="24">
        <NFormItemGi
          :span="8"
          path="customerName"
          :label="t('TEMP.Cabinet.OrderStatus.customerName')"
        >
          <NInput
            v-model:value="formData.customerName"
            :placeholder="t('TEMP.Cabinet.OrderStatus.customerName')"
            clearable
          />
        </NFormItemGi>
        <NFormItemGi
          :span="16"
          path="address"
          :label="t('TEMP.Cabinet.OrderStatus.address')"
        >
          <NInput
            v-model:value="formData.address"
            :placeholder="t('TEMP.Cabinet.OrderStatus.address')"
            clearable
          />
        </NFormItemGi>
      </nGrid>

      <nGrid :cols="24">
        <NFormItemGi
          :span="8"
          path="telephone"
          :label="t('TEMP.Cabinet.OrderStatus.telephone')"
        >
          <NInput
            v-model:value="formData.telephone"
            :placeholder="t('TEMP.Cabinet.OrderStatus.telephone')"
            clearable
          />
        </NFormItemGi>
        <NFormItemGi
          :span="8"
          path="productName"
          :label="t('TEMP.Cabinet.OrderStatus.productName')"
        >
          <NInput
            v-model:value="formData.productName"
            :placeholder="t('TEMP.Cabinet.OrderStatus.productName')"
            clearable
          />
        </NFormItemGi>
        <NFormItemGi
          :span="8"
          path="allTotalPrice"
          :label="t('TEMP.Cabinet.OrderStatus.allTotalPrice')"
        >
          <nInputNumber
            v-model:value="formData.allTotalPrice"
            :placeholder="t('TEMP.Cabinet.OrderStatus.allTotalPrice')"
            type="number"
            show-count
            clearable
            :parse="parse"
            :format="format"
            :show-button="false"
            style="width: 100%"
          >
            <template #suffix>
              元
            </template>
          </nInputNumber>
        </NFormItemGi>
      </nGrid>

      <nGrid :cols="24">
        <NFormItemGi
          :span="8"
          path="paidPrice"
          :label="t('TEMP.Cabinet.OrderStatus.paidPrice')"
        >
          <nInputNumber
            v-model:value="formData.paidPrice"
            :placeholder="t('TEMP.Cabinet.OrderStatus.paidPrice')"
            type="number"
            show-count
            clearable
            :parse="parse"
            :format="format"
            :show-button="false"
            style="width: 100%"
          >
            <template #suffix>
              元
            </template>
          </nInputNumber>
        </NFormItemGi>
        <NFormItemGi
          :span="8"
          path="unPaidPrice"
          :label="t('TEMP.Cabinet.OrderStatus.unPaidPrice')"
        >
          <nInputNumber
            v-model:value="formData.unPaidPrice"
            :placeholder="t('TEMP.Cabinet.OrderStatus.unPaidPrice')"
            type="number"
            show-count
            clearable
            :parse="parse"
            :format="format"
            :show-button="false"
            style="width: 100%"
          >
            <template #suffix>
              元
            </template>
          </nInputNumber>
        </NFormItemGi>
      </nGrid>

      <nGrid :cols="24">
        <NFormItemGi
          :span="24"
          path="remark"
          :label="t('TEMP.Cabinet.OrderStatus.remark')"
        >
          <NInput
            v-model:value="formData.remark"
            :placeholder="t('TEMP.Cabinet.OrderStatus.remark')"
            clearable
            type="textarea"
            :autosize="{
              minRows: 3,
              maxRows: 5
             }"
          />
        </NFormItemGi>
      </nGrid>

      <n-divider title-placement="left" style="margin-top: -10px">
        {{ t('TEMP.Cabinet.Quotation.attachFiles') }}
      </n-divider>

      <n-upload
          multiple
          directory-dnd
          :max="10"
          style="margin-top: -20px"
          @change="uploadAvatarUrl"
        >
          <n-upload-dragger>
            <div style="margin-bottom: 12px">
              <n-icon size="48" :depth="3">
                <archive-icon/>
              </n-icon>
            </div>
            <n-text style="font-size: 16px">
              点击或者拖动文件到该区域来上传
            </n-text>
            <n-p depth="3" style="margin: 8px 0 0 0">
              请不要上传敏感数据，比如你的银行卡号和密码，信用卡号有效期和安全码
            </n-p>
          </n-upload-dragger>
        </n-upload>

    </NForm>

    <NForm
      v-else-if="isEdit === 'edit'"
      ref="formRef"
      :model="formData"
      :rules="noticeRules"
      label-width="auto"
      require-mark-placement="right-hanging"
      class="flex flex-col"
      label-placement="left"
    >
      <nGrid :cols="24">
        <NFormItemGi
          :span="8"
          path="customerName"
          :label="t('TEMP.Cabinet.OrderStatus.customerName')"
        >
          <NInput
            v-model:value="formData.customerName"
            :placeholder="t('TEMP.Cabinet.OrderStatus.customerName')"
            clearable
          />
        </NFormItemGi>
        <NFormItemGi
          :span="16"
          path="address"
          :label="t('TEMP.Cabinet.OrderStatus.address')"
        >
          <NInput
            v-model:value="formData.address"
            :placeholder="t('TEMP.Cabinet.OrderStatus.address')"
            clearable
          />
        </NFormItemGi>
      </nGrid>

      <nGrid :cols="24">
        <NFormItemGi
          :span="8"
          path="telephone"
          :label="t('TEMP.Cabinet.OrderStatus.telephone')"
        >
          <NInput
            v-model:value="formData.telephone"
            :placeholder="t('TEMP.Cabinet.OrderStatus.telephone')"
            clearable
          />
        </NFormItemGi>
        <NFormItemGi
          :span="8"
          path="productName"
          :label="t('TEMP.Cabinet.OrderStatus.productName')"
        >
          <NInput
            v-model:value="formData.productName"
            :placeholder="t('TEMP.Cabinet.OrderStatus.productName')"
            clearable
          />
        </NFormItemGi>
        <NFormItemGi
          :span="8"
          path="allTotalPrice"
          :label="t('TEMP.Cabinet.OrderStatus.allTotalPrice')"
        >
          <nInputNumber
            v-model:value="formData.allTotalPrice"
            :placeholder="t('TEMP.Cabinet.OrderStatus.allTotalPrice')"
            type="number"
            show-count
            clearable
            :parse="parse"
            :format="format"
            :show-button="false"
            style="width: 100%"
          >
            <template #suffix>
              元
            </template>
          </nInputNumber>
        </NFormItemGi>
      </nGrid>

      <nGrid :cols="24">
        <NFormItemGi
          :span="8"
          path="paidPrice"
          :label="t('TEMP.Cabinet.OrderStatus.paidPrice')"
        >
          <nInputNumber
            v-model:value="formData.paidPrice"
            :placeholder="t('TEMP.Cabinet.OrderStatus.paidPrice')"
            type="number"
            show-count
            clearable
            :parse="parse"
            :format="format"
            :show-button="false"
            style="width: 100%"
          >
            <template #suffix>
              元
            </template>
          </nInputNumber>
        </NFormItemGi>
        <NFormItemGi
          :span="8"
          path="unPaidPrice"
          :label="t('TEMP.Cabinet.OrderStatus.unPaidPrice')"
        >
          <nInputNumber
            v-model:value="formData.unPaidPrice"
            :placeholder="t('TEMP.Cabinet.OrderStatus.unPaidPrice')"
            type="number"
            show-count
            clearable
            :parse="parse"
            :format="format"
            :show-button="false"
            style="width: 100%"
          >
            <template #suffix>
              元
            </template>
          </nInputNumber>
        </NFormItemGi>
      </nGrid>

      <nGrid :cols="24">
        <NFormItemGi
          :span="24"
          path="remark"
          :label="t('TEMP.Cabinet.OrderStatus.remark')"
        >
          <NInput
            v-model:value="formData.remark"
            :placeholder="t('TEMP.Cabinet.OrderStatus.remark')"
            clearable
            type="textarea"
            :autosize="{
              minRows: 3,
              maxRows: 5
             }"
          />
        </NFormItemGi>
      </nGrid>

      <n-divider title-placement="left" style="margin-top: -10px">
        {{ t('TEMP.Cabinet.Quotation.attachFiles') }}
      </n-divider>

      <n-upload
        v-model:file-list="fileList"
        multiple
        directory-dnd
        :max="10"
        style="margin-top: -20px"
        show-download-button
        @change="uploadAvatarUrl"
        @remove="onRemove"
        @download="handleDownload"
      >
        <n-upload-dragger>
          <div style="margin-bottom: 12px">
            <n-icon size="48" :depth="3">
              <archive-icon/>
            </n-icon>
          </div>
          <n-text style="font-size: 16px">
            点击或者拖动文件到该区域来上传
          </n-text>
          <n-p depth="3" style="margin: 8px 0 0 0">
            请不要上传敏感数据，比如你的银行卡号和密码，信用卡号有效期和安全码
          </n-p>
        </n-upload-dragger>
      </n-upload>

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
