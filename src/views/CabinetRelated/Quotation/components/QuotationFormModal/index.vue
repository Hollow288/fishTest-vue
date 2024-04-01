<script setup lang="ts">
// Todo 为什么这样的引入不行？
// import {Eye20Regular as ViewIcon20Regular} from '@vicons/fluent'
// import Eye16Regular from '@vicons/fluent/Eye16Regular'
import {AddSharp, ArchiveOutline as ArchiveIcon,TrashBinOutline} from '@vicons/ionicons5'
import {cloneDeep} from 'lodash-es'
import type {FormInst, FormRules, FormValidationError,UploadFileInfo} from 'naive-ui'

import type {MessageSchema} from '@/types'
import type {CabinetQuotation} from '@/types/api/cabinetQuotation'
import type {CabinetQuotationDetail} from '@/types/api/cabinetQuotationDetail'
import CreateIcon from '~icons/ic/sharp-add'
import EditIcon from '~icons/ic/sharp-edit'
import ViewIcon from '~icons/mdi/file-search-outline'

export interface Props {
  quotationFormData?: CabinetQuotation
  quotationState: string
}

const props = defineProps<Props>()

const fileListRef = ref([])

const loadingRef = ref(true)

const emit = defineEmits<{
  (e: 'save'): void
}>()

const {t} = useI18n<{ message: MessageSchema }>()

const NMessage = useMessage()
const [submitLoading, submitLoadingDispatcher] = useLoading()

const formRef = ref<FormInst | null>(null)
const formData = ref<CabinetQuotation>({})
// const detail = ref<CabinetQuotationDetail>({})
const detailData = ref<CabinetQuotationDetail>([])
const fileList = ref<UploadFileInfo[]>([])
const willRemoveAttachs = ref<string>([])
const showModal = ref(false)

const emptyCabinetQuotationDetail: {
  unitPrice: number;
  detailType: string;
  specificationModel: string;
  pricingCoefficient: number;
  detailId: string;
  remark: string;
  pricingQuantity: number;
  projectName: string;
  priceAmount: number;
  isChecked: boolean
} = {
  detailId: '',
  projectName: '',
  specificationModel: '',
  pricingQuantity: 0,
  unitPrice: 0,
  pricingCoefficient: 1,
  priceAmount: 0,
  remark: '',
  detailType: '',
  isChecked: false
}


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

const addCabinetsDetailRow = () => {
  const temObj = cloneDeep(emptyCabinetQuotationDetail)
  temObj.detailType = '0'
  detailData.value.push(temObj)
}


const addKitchenwareHardwareDetailRow = () => {
  const temObj = cloneDeep(emptyCabinetQuotationDetail)
  temObj.detailType = '1'
  detailData.value.push(temObj)
}


const deleteCabinetsSelectedRows = () => {
  detailData.value = detailData.value.filter(m => (!m.isChecked && m.detailType === '0') || m.detailType !== '0')
  detailData.value.filter(item => item.detailType === '0').forEach(item => {
    item.isChecked = false
  })
}

const deleteKitchenwareHardwareSelectedRows = () => {
  detailData.value = detailData.value.filter(m => (!m.isChecked && m.detailType === '1') || m.detailType !== '1')
  detailData.value.filter(item => item.detailType === '1').forEach(item => {
    item.isChecked = false
  })
}


const checkAllCabinetsDetail = (checked) => {
// 遍历 detailType 为 '0' 的元素，根据情况更新 isChecked 属性
  detailData.value.filter(item => item.detailType === '0').forEach(item => {
    item.isChecked = !!checked
  })
}


const checkAllKitchenwareHardwareDetail = (checked) => {
// 遍历 detailType 为 '0' 的元素，根据情况更新 isChecked 属性
  detailData.value.filter(item => item.detailType === '1').forEach(item => {
    item.isChecked = !!checked
  })
}


const uploadAvatarUrl = (options: { fileList: UploadFileInfo[] }) => {
  const files = options.fileList.map(item => item.file)
  fileListRef.value = files
  // console.log(fileListRef.value)
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


  if (props.quotationState === 'create') {
    try {
      formData.value.cabinetQuotationDetails = detailData.value
      formData.value.cabinetTotalPrice = cabinetTotalPrice
      formData.value.electricalTotalPrice = electricalTotalPricePrice

      const {
        data: createData,
        code: createCode,
        message: createMessage
      } = await CabinetRelatedAPI.createQuotation(formData.value)

      if (fileListRef.value.length > 0) {
        const fileData = new FormData()
        fileListRef.value.forEach(file => {
          fileData.append('file', file)
        })
        const {code: updateCode, message} = await UploadAPI.uploadQuotationFile(fileData, createData)

        if (createCode == 200 && updateCode == 200) {
          NMessage.success(message!)
          showModal.value = false
          emit('save')
        } else {
          NMessage.error('服务器异常')
        }
      } else if (createCode == 200) {
          NMessage.success(createMessage!)
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
  } else if (props.quotationState === 'edit') {
    try {
      formData.value.cabinetQuotationDetails = detailData.value
      formData.value.cabinetTotalPrice = cabinetTotalPrice
      formData.value.electricalTotalPrice = electricalTotalPricePrice

      // 修改主表信息和子表信息
      const {
        message: updateMessage,
        code: updateCode
      } = await CabinetRelatedAPI.updateQuotation(formData.value, formData.value.quotationId)

      // 要删除的附件
      const temObj = {ids: willRemoveAttachs.value}
      const {code: removeCode} = await CabinetRelatedAPI.removeQuotationAttachs(temObj)

      // 上传新的附件
      if (fileListRef.value.filter(file => file !== null).length > 0) {
        const fileData = new FormData()
        fileListRef.value.filter(file => file !== null).forEach(file => {
          fileData.append('file', file)
        })
        const {code: uploadCode} = await UploadAPI.uploadQuotationFile(fileData, formData.value.quotationId)
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


const actonTest = () => h(
  'div',
  {
    class: 'space-x-3 flex justify-center',
    style: 'margin-top: 5px'
  }, props.quotationState === 'view' ? [
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


const handleDownload = (file: UploadFileInfo) => {
  DownloadAPI.getDownloadQuotation(file.id).then(result => {

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


const onRemove = (options: { file: UploadFileInfo, fileList: Array<UploadFileInfo> }) => {
  willRemoveAttachs.value.push(options.file.id)
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
  () => props.quotationFormData,
  async (newValue) => {
    if (props.quotationState === 'create') {
      formData.value = {
        ...newValue,
      }
      detailData.value = []
      fileListRef.value = []
      willRemoveAttachs.value = []
    } else if (props.quotationState === 'edit') {

      formData.value = {
        ...newValue,
        ...(newValue.quotationDate && {
          quotationDate: TimeUtils.formatTime(newValue.quotationDate, 'YYYY-MM-DD')
        }),
        ...(newValue.createTime && {
          createTime: TimeUtils.formatTime(newValue.createTime, 'YYYY-MM-DD')
        }),
        ...(newValue.updateTime && {
          updateTime: TimeUtils.formatTime(newValue.updateTime, 'YYYY-MM-DD')
        })
      }
      if (formData.value.quotationId !== null && typeof formData.value.quotationId !== 'undefined') {
        // 子表信息
        const {
          code: detailCode,
          data: detailDatas
        } = await CabinetRelatedAPI.getDetailDataByQuotationId(formData.value.quotationId)
        // 附件信息
        const {
          code: attachCode,
          data: attachDatas
        } = await CabinetRelatedAPI.getAttachDataByQuotationId(formData.value.quotationId)
        if (detailCode == 200 && attachCode == 200) {
          detailData.value = detailDatas
          fileList.value = attachDatas
        } else {
          NMessage.error('数据读取错误')
        }
      }
      fileListRef.value = []
      willRemoveAttachs.value = []
    } else {
      formData.value = {
        ...newValue,
        ...(newValue.quotationDate && {
          quotationDate: TimeUtils.formatTime(newValue.quotationDate, 'YYYY-MM-DD')
        }),
        ...(newValue.createTime && {
          createTime: TimeUtils.formatTime(newValue.createTime, 'YYYY-MM-DD')
        }),
        ...(newValue.updateTime && {
          updateTime: TimeUtils.formatTime(newValue.updateTime, 'YYYY-MM-DD')
        })
      }

      if (formData.value.quotationId !== null && typeof formData.value.quotationId !== 'undefined') {
        // 子表信息
        const {
          code: detailCode,
          data: detailDatas
        } = await CabinetRelatedAPI.getDetailDataByQuotationId(formData.value.quotationId)
        // 附件信息
        const {
          code: attachCode,
          data: attachDatas
        } = await CabinetRelatedAPI.getAttachDataByQuotationId(formData.value.quotationId)
        if (detailCode == 200 && attachCode == 200) {
          detailData.value = detailDatas
          fileList.value = attachDatas
        } else {
          NMessage.error('数据读取错误')
        }
      }
      fileListRef.value = []
      willRemoveAttachs.value = []
    }
  },
  {immediate: true,}
)


watch(
  () => detailData.value,
  (newDetailData, oldDetailData) => {
    // 在这里重新计算 detailData 数组中的 priceAmount
    newDetailData.forEach(item => {
      if (item.pricingQuantity !== undefined && item.unitPrice !== undefined && item.pricingCoefficient !== undefined) {
        item.priceAmount = Number((item.pricingQuantity * item.unitPrice * item.pricingCoefficient).toFixed(2))
      } else {
        // console.error('Missing data for price calculation')
        item.priceAmount = 0
      }
    })
  },
  {deep: true}
)


watch(
  () => detailData.value,
  (newDetailData) => {
    // 计算所有行的 priceAmount 的综合
    let total = 0
    // eslint-disable-next-line no-restricted-syntax
    for (const item of newDetailData) {
      total += item.priceAmount || 0
    }
    // 更新 formData.allTotalPrice
    formData.value.allTotalPrice = total
  },
  {deep: true}
)


const cabinetTotalPrice = computed({
  get() {
    let temPrice = 0
    detailData.value.forEach(m => {
      if (m.detailType === '0') {
        temPrice += m.priceAmount
      }
    })
    return Number(temPrice)
  }
})


const electricalTotalPricePrice = computed({
  get() {
    let temPrice = 0
    detailData.value.forEach(m => {
      if (m.detailType === '1') {
        temPrice += m.priceAmount
      }
    })
    return Number(temPrice)
  }
})


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
    :title="quotationState === 'create' ? t('TEMP.Cabinet.Quotation.create') : (quotationState === 'edit' ? t('TEMP.Cabinet.Quotation.edit') : (quotationState === 'view' ? t('TEMP.Cabinet.Quotation.view') : t('TEMP.Cabinet.Quotation.view')))"
    :loading="submitLoading"
    :action="actonTest"
    :mask-closable="false"
  >
    <template #icon>
      <NIcon
        size="24"
        :component="quotationState === 'create' ? CreateIcon : (quotationState === 'edit' ? EditIcon : ViewIcon)"
      />
    </template>

    <NForm
      v-if="quotationState === 'create'"
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

      <nGrid :cols="24">
        <NFormItemGi
          :span="8"
          path="customerName"
          :label="t('TEMP.Cabinet.Quotation.customerName')"
        >
          <NInput
            v-model:value="formData.customerName"
            :placeholder="t('TEMP.Cabinet.Quotation.customerName')"
            maxlength="10"
            show-count
            clearable
          />

        </NFormItemGi>


        <NFormItemGi
          :span="16"
          path="address"
          :label="t('TEMP.Cabinet.Quotation.address')"
        >
          <NInput
            v-model:value="formData.address"
            :placeholder="t('TEMP.Cabinet.Quotation.address')"
            maxlength="100"
            show-count
            clearable
          />

        </NFormItemGi>

      </nGrid>

      <nGrid :cols="24">
        <NFormItemGi
          :span="8"
          path="productName"
          :label="t('TEMP.Cabinet.Quotation.productName')"
        >
          <NInput
            v-model:value="formData.productName"
            :placeholder="t('TEMP.Cabinet.Quotation.productName')"
            maxlength="50"
            show-count
            clearable
          />

        </NFormItemGi>

        <NFormItemGi
          :span="8"
          path="cabinetBody"
          :label="t('TEMP.Cabinet.Quotation.cabinetBody')"
        >
          <NInput
            v-model:value="formData.cabinetBody"
            :placeholder="t('TEMP.Cabinet.Quotation.cabinetBody')"
            maxlength="20"
            show-count
            clearable
          />

        </NFormItemGi>

        <NFormItemGi
          :span="8"
          path="color"
          :label="t('TEMP.Cabinet.Quotation.color')"
        >
          <NInput
            v-model:value="formData.color"
            :placeholder="t('TEMP.Cabinet.Quotation.color')"
            maxlength="20"
            show-count
            clearable
          />

        </NFormItemGi>

      </nGrid>

      <nGrid :cols="24">

        <NFormItemGi
          :span="8"
          path="telephone"
          :label="t('TEMP.Cabinet.Quotation.telephone')"
        >
          <NInput
            v-model:value="formData.telephone"
            :placeholder="t('TEMP.Cabinet.Quotation.telephone')"
            maxlength="20"
            show-count
            clearable
          />

        </NFormItemGi>


        <NFormItemGi
          :span="8"
          path="quotationDate"
          :label="t('TEMP.Cabinet.Quotation.quotationDate')"
        >

          <n-date-picker v-model:formatted-value="formData.quotationDate" type="date" style="width: 100%"/>

        </NFormItemGi>


        <NFormItemGi
          :span="8"
          path="productName"
          :label="t('TEMP.Cabinet.Quotation.allTotalPrice')"
        >
          <nInputNumber
            v-model:value="formData.allTotalPrice"
            :placeholder="t('TEMP.Cabinet.Quotation.allTotalPrice')"
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

      <n-divider title-placement="left" style="margin-top: -10px">
        {{ t('TEMP.Cabinet.Quotation.Cabinets') }}
      </n-divider>


      <div class="flex flex-col items-center space-y-2 sm:flex-row sm:justify-between sm:space-y-0">
        <div class="flex w-full items-center !space-x-2 sm:w-fit " style="margin-top: -20px">
          <n-button secondary strong @click="addCabinetsDetailRow">
            <template #icon>
              <n-icon :component="AddSharp">
                <!--                <AddSharp-icon />-->
              </n-icon>
            </template>
            {{ t('COMMON.Insert') }}
          </n-button>

          <!--        @click="deleteNotices"-->
          <n-button secondary strong @click="deleteCabinetsSelectedRows">
            <template #icon>
              <n-icon :component="TrashBinOutline">
              </n-icon>
            </template>
            {{ t('COMMON.DELETE') }}
          </n-button>
        </div>


        <div class="flex w-full items-center justify-between  sm:justify-end ">


          <n-gradient-text type="info" style="font-size: 16px">
            橱柜类总计：{{ cabinetTotalPrice }}元
          </n-gradient-text>

          <!--          </n-divider>-->
        </div>


      </div>


      <NTable :bordered="false" :single-line="false" style="margin-top: 5px" class="custom-table" size="small">
        <thead>
        <tr>
          <th style="width:15px;">
            <n-checkbox @change="checkAllCabinetsDetail"/>
          </th>
          <th style="width:20px;">
            {{ t('TEMP.Cabinet.Quotation.serialNumber') }}
          </th>
          <th>
            {{ t('TEMP.Cabinet.Quotation.projectName') }}
          </th>
          <th>
            {{ t('TEMP.Cabinet.Quotation.specificationModel') }}
          </th>
          <th>
            {{ t('TEMP.Cabinet.Quotation.pricingQuantity') }}
          </th>
          <th>
            {{ t('TEMP.Cabinet.Quotation.unitPrice') }}
          </th>
          <th>
            {{ t('TEMP.Cabinet.Quotation.pricingCoefficient') }}
          </th>
          <th>
            {{ t('TEMP.Cabinet.Quotation.priceAmount') }}
          </th>
          <th>
            {{ t('TEMP.Cabinet.Quotation.remark') }}
          </th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(n,i) in detailData.filter(m=>m.detailType==='0')" :key="i">
          <td>
            <!--            &#45;&#45;{{n.isChecked}}-->
            <n-checkbox v-model:checked="n.isChecked"/>
          </td>
          <td>
            {{ i + 1 }}
          </td>
          <td>
            <NInput
              v-model:value="n.projectName"
              :placeholder="t('TEMP.Cabinet.Quotation.projectName')"
              clearable
            />
          </td>
          <td>
            <NInput
              v-model:value="n.specificationModel"
              :placeholder="t('TEMP.Cabinet.Quotation.specificationModel')"
              clearable
            />
          </td>
          <td>
            <NInputNumber
              v-model:value="n.pricingQuantity"
              :placeholder="t('TEMP.Cabinet.Quotation.pricingQuantity')"
              type="number"
              show-count
              clearable
              :precision="2"
              :show-button="false"
              style="width: 100%"
            >
            </NInputNumber>
          </td>
          <td>
            <NInputNumber
              v-model:value="n.unitPrice"
              :placeholder="t('TEMP.Cabinet.Quotation.unitPrice')"
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
            </NInputNumber>
          </td>
          <td>
            <NInputNumber
              v-model:value="n.pricingCoefficient"
              :placeholder="t('TEMP.Cabinet.Quotation.pricingCoefficient')"
              type="number"
              show-count
              clearable
              :precision="2"
              :show-button="false"
              style="width: 100%"
            >
            </NInputNumber>
          </td>
          <td>
            <NInputNumber
              v-model:value="n.priceAmount"
              :placeholder="t('TEMP.Cabinet.Quotation.priceAmount')"
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
            </NInputNumber>
          </td>
          <td>
            <NInput
              v-model:value="n.remark"
              :placeholder="t('TEMP.Cabinet.Quotation.remark')"
              clearable
            />
          </td>

        </tr>
        </tbody>

      </NTable>


      <n-divider title-placement="left" style="margin-top: 10px">
        {{ t('TEMP.Cabinet.Quotation.kitchenwareHardware') }}
      </n-divider>


      <div class="flex flex-col items-center space-y-2 sm:flex-row sm:justify-between sm:space-y-0">
        <div class="flex w-full items-center !space-x-2 sm:w-fit " style="margin-top: -20px">
          <n-button secondary strong @click="addKitchenwareHardwareDetailRow">
            <template #icon>
              <n-icon :component="AddSharp">
                <!--                <AddSharp-icon />-->
              </n-icon>
            </template>
            {{ t('COMMON.Insert') }}
          </n-button>

          <!--        @click="deleteNotices"-->
          <n-button secondary strong @click="deleteKitchenwareHardwareSelectedRows">
            <template #icon>
              <n-icon :component="TrashBinOutline">
              </n-icon>
            </template>
            {{ t('COMMON.DELETE') }}
          </n-button>
        </div>


        <div class="flex w-full items-center justify-between  sm:justify-end ">


          <n-gradient-text type="info" style="font-size: 16px">
            厨具五金类总计：{{ electricalTotalPricePrice }}元
          </n-gradient-text>

          <!--          </n-divider>-->
        </div>


      </div>

      <NTable :bordered="false" :single-line="false" style="margin-top: 5px;" class="custom-table" size="small">
        <thead>
        <tr>
          <th style="width:15px;">
            <n-checkbox @change="checkAllKitchenwareHardwareDetail"/>
          </th>
          <th style="width:20px;">
            {{ t('TEMP.Cabinet.Quotation.serialNumber') }}
          </th>
          <th>
            {{ t('TEMP.Cabinet.Quotation.projectName') }}
          </th>
          <th>
            {{ t('TEMP.Cabinet.Quotation.specificationModel') }}
          </th>
          <th>
            {{ t('TEMP.Cabinet.Quotation.pricingQuantity') }}
          </th>
          <th>
            {{ t('TEMP.Cabinet.Quotation.unitPrice') }}
          </th>
          <th>
            {{ t('TEMP.Cabinet.Quotation.pricingCoefficient') }}
          </th>
          <th>
            {{ t('TEMP.Cabinet.Quotation.priceAmount') }}
          </th>
          <th>
            {{ t('TEMP.Cabinet.Quotation.remark') }}
          </th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(n,i) in detailData.filter(m=>m.detailType==='1')" :key="i">
          <td>
            <n-checkbox v-model:checked="n.isChecked"/>
          </td>
          <td>
            {{ i + 1 }}
          </td>
          <td>
            <NInput
              v-model:value="n.projectName"
              :placeholder="t('TEMP.Cabinet.Quotation.projectName')"
              clearable
            />
          </td>
          <td>
            <NInput
              v-model:value="n.specificationModel"
              :placeholder="t('TEMP.Cabinet.Quotation.specificationModel')"
              clearable
            />
          </td>
          <td>
            <NInputNumber
              v-model:value="n.pricingQuantity"
              :placeholder="t('TEMP.Cabinet.Quotation.pricingQuantity')"
              type="number"
              show-count
              clearable
              :precision="0"
              :show-button="false"
              style="width: 100%"
            >
            </NInputNumber>
          </td>
          <td>
            <NInputNumber
              v-model:value="n.unitPrice"
              :placeholder="t('TEMP.Cabinet.Quotation.unitPrice')"
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
            </NInputNumber>
          </td>
          <td>
            <NInputNumber
              v-model:value="n.pricingCoefficient"
              :placeholder="t('TEMP.Cabinet.Quotation.pricingCoefficient')"
              type="number"
              show-count
              clearable
              :precision="2"
              :show-button="false"
              style="width: 100%"
            >
            </NInputNumber>
          </td>
          <td>
            <NInputNumber
              v-model:value="n.priceAmount"
              :placeholder="t('TEMP.Cabinet.Quotation.priceAmount')"
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
            </NInputNumber>
          </td>
          <td>
            <NInput
              v-model:value="n.remark"
              :placeholder="t('TEMP.Cabinet.Quotation.remark')"
              clearable
            />
          </td>

        </tr>
        </tbody>

      </NTable>
      <n-divider title-placement="left" style="margin-top: 10px">
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
      v-else-if="quotationState === 'edit'"
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

      <nGrid :cols="24">
        <NFormItemGi
          :span="8"
          path="customerName"
          :label="t('TEMP.Cabinet.Quotation.customerName')"
        >
          <NInput
            v-model:value="formData.customerName"
            :placeholder="t('TEMP.Cabinet.Quotation.customerName')"
            maxlength="10"
            show-count
            clearable
          />

        </NFormItemGi>


        <NFormItemGi
          :span="16"
          path="address"
          :label="t('TEMP.Cabinet.Quotation.address')"
        >
          <NInput
            v-model:value="formData.address"
            :placeholder="t('TEMP.Cabinet.Quotation.address')"
            maxlength="100"
            show-count
            clearable
          />

        </NFormItemGi>

      </nGrid>

      <nGrid :cols="24">
        <NFormItemGi
          :span="8"
          path="productName"
          :label="t('TEMP.Cabinet.Quotation.productName')"
        >
          <NInput
            v-model:value="formData.productName"
            :placeholder="t('TEMP.Cabinet.Quotation.productName')"
            maxlength="50"
            show-count
            clearable
          />

        </NFormItemGi>

        <NFormItemGi
          :span="8"
          path="cabinetBody"
          :label="t('TEMP.Cabinet.Quotation.cabinetBody')"
        >
          <NInput
            v-model:value="formData.cabinetBody"
            :placeholder="t('TEMP.Cabinet.Quotation.cabinetBody')"
            maxlength="20"
            show-count
            clearable
          />

        </NFormItemGi>

        <NFormItemGi
          :span="8"
          path="color"
          :label="t('TEMP.Cabinet.Quotation.color')"
        >
          <NInput
            v-model:value="formData.color"
            :placeholder="t('TEMP.Cabinet.Quotation.color')"
            maxlength="20"
            show-count
            clearable
          />

        </NFormItemGi>

      </nGrid>

      <nGrid :cols="24">

        <NFormItemGi
          :span="8"
          path="telephone"
          :label="t('TEMP.Cabinet.Quotation.telephone')"
        >
          <NInput
            v-model:value="formData.telephone"
            :placeholder="t('TEMP.Cabinet.Quotation.telephone')"
            maxlength="20"
            show-count
            clearable
          />

        </NFormItemGi>


        <NFormItemGi
          :span="8"
          path="quotationDate"
          :label="t('TEMP.Cabinet.Quotation.quotationDate')"
        >

          <n-date-picker v-model:formatted-value="formData.quotationDate" type="date" style="width: 100%"/>

        </NFormItemGi>


        <NFormItemGi
          :span="8"
          path="productName"
          :label="t('TEMP.Cabinet.Quotation.allTotalPrice')"
        >
          <nInputNumber
            v-model:value="formData.allTotalPrice"
            :placeholder="t('TEMP.Cabinet.Quotation.allTotalPrice')"
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

      <n-divider title-placement="left" style="margin-top: -10px">
        {{ t('TEMP.Cabinet.Quotation.Cabinets') }}
      </n-divider>


      <div class="flex flex-col items-center space-y-2 sm:flex-row sm:justify-between sm:space-y-0">
        <div class="flex w-full items-center !space-x-2 sm:w-fit " style="margin-top: -20px">
          <n-button secondary strong @click="addCabinetsDetailRow">
            <template #icon>
              <n-icon :component="AddSharp">
                <!--                <AddSharp-icon />-->
              </n-icon>
            </template>
            {{ t('COMMON.Insert') }}
          </n-button>

          <!--        @click="deleteNotices"-->
          <n-button secondary strong @click="deleteCabinetsSelectedRows">
            <template #icon>
              <n-icon :component="TrashBinOutline">
              </n-icon>
            </template>
            {{ t('COMMON.DELETE') }}
          </n-button>
        </div>


        <div class="flex w-full items-center justify-between  sm:justify-end ">


          <n-gradient-text type="info" style="font-size: 16px">
            橱柜类总计：{{ cabinetTotalPrice }}元
          </n-gradient-text>

          <!--          </n-divider>-->
        </div>


      </div>


      <NTable :bordered="false" :single-line="false" style="margin-top: 5px" class="custom-table" size="small">
        <thead>
        <tr>
          <th style="width:15px;">
            <n-checkbox @change="checkAllCabinetsDetail"/>
          </th>
          <th style="width:20px;">
            {{ t('TEMP.Cabinet.Quotation.serialNumber') }}
          </th>
          <th>
            {{ t('TEMP.Cabinet.Quotation.projectName') }}
          </th>
          <th>
            {{ t('TEMP.Cabinet.Quotation.specificationModel') }}
          </th>
          <th>
            {{ t('TEMP.Cabinet.Quotation.pricingQuantity') }}
          </th>
          <th>
            {{ t('TEMP.Cabinet.Quotation.unitPrice') }}
          </th>
          <th>
            {{ t('TEMP.Cabinet.Quotation.pricingCoefficient') }}
          </th>
          <th>
            {{ t('TEMP.Cabinet.Quotation.priceAmount') }}
          </th>
          <th>
            {{ t('TEMP.Cabinet.Quotation.remark') }}
          </th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(n,i) in detailData.filter(m=>m.detailType==='0')" :key="i">
          <td>
            <!--            &#45;&#45;{{n.isChecked}}-->
            <n-checkbox v-model:checked="n.isChecked"/>
          </td>
          <td>
            {{ i + 1 }}
          </td>
          <td>
            <NInput
              v-model:value="n.projectName"
              :placeholder="t('TEMP.Cabinet.Quotation.projectName')"
              clearable
            />
          </td>
          <td>
            <NInput
              v-model:value="n.specificationModel"
              :placeholder="t('TEMP.Cabinet.Quotation.specificationModel')"
              clearable
            />
          </td>
          <td>
            <NInputNumber
              v-model:value="n.pricingQuantity"
              :placeholder="t('TEMP.Cabinet.Quotation.pricingQuantity')"
              type="number"
              show-count
              clearable
              :precision="2"
              :show-button="false"
              style="width: 100%"
            >
            </NInputNumber>
          </td>
          <td>
            <NInputNumber
              v-model:value="n.unitPrice"
              :placeholder="t('TEMP.Cabinet.Quotation.unitPrice')"
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
            </NInputNumber>
          </td>
          <td>
            <NInputNumber
              v-model:value="n.pricingCoefficient"
              :placeholder="t('TEMP.Cabinet.Quotation.pricingCoefficient')"
              type="number"
              show-count
              clearable
              :precision="2"
              :show-button="false"
              style="width: 100%"
            >
            </NInputNumber>
          </td>
          <td>
            <NInputNumber
              v-model:value="n.priceAmount"
              :placeholder="t('TEMP.Cabinet.Quotation.priceAmount')"
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
            </NInputNumber>
          </td>
          <td>
            <NInput
              v-model:value="n.remark"
              :placeholder="t('TEMP.Cabinet.Quotation.remark')"
              clearable
            />
          </td>

        </tr>
        </tbody>

      </NTable>


      <n-divider title-placement="left" style="margin-top: 10px">
        {{ t('TEMP.Cabinet.Quotation.kitchenwareHardware') }}
      </n-divider>


      <div class="flex flex-col items-center space-y-2 sm:flex-row sm:justify-between sm:space-y-0">
        <div class="flex w-full items-center !space-x-2 sm:w-fit " style="margin-top: -20px">
          <n-button secondary strong @click="addKitchenwareHardwareDetailRow">
            <template #icon>
              <n-icon :component="AddSharp">
                <!--                <AddSharp-icon />-->
              </n-icon>
            </template>
            {{ t('COMMON.Insert') }}
          </n-button>

          <!--        @click="deleteNotices"-->
          <n-button secondary strong @click="deleteKitchenwareHardwareSelectedRows">
            <template #icon>
              <n-icon :component="TrashBinOutline">
              </n-icon>
            </template>
            {{ t('COMMON.DELETE') }}
          </n-button>
        </div>


        <div class="flex w-full items-center justify-between  sm:justify-end ">


          <n-gradient-text type="info" style="font-size: 16px">
            厨具五金类总计：{{ electricalTotalPricePrice }}元
          </n-gradient-text>

          <!--          </n-divider>-->
        </div>


      </div>

      <NTable :bordered="false" :single-line="false" style="margin-top: 5px;" class="custom-table" size="small">
        <thead>
        <tr>
          <th style="width:15px;">
            <n-checkbox @change="checkAllKitchenwareHardwareDetail"/>
          </th>
          <th style="width:20px;">
            {{ t('TEMP.Cabinet.Quotation.serialNumber') }}
          </th>
          <th>
            {{ t('TEMP.Cabinet.Quotation.projectName') }}
          </th>
          <th>
            {{ t('TEMP.Cabinet.Quotation.specificationModel') }}
          </th>
          <th>
            {{ t('TEMP.Cabinet.Quotation.pricingQuantity') }}
          </th>
          <th>
            {{ t('TEMP.Cabinet.Quotation.unitPrice') }}
          </th>
          <th>
            {{ t('TEMP.Cabinet.Quotation.pricingCoefficient') }}
          </th>
          <th>
            {{ t('TEMP.Cabinet.Quotation.priceAmount') }}
          </th>
          <th>
            {{ t('TEMP.Cabinet.Quotation.remark') }}
          </th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(n,i) in detailData.filter(m=>m.detailType==='1')" :key="i">
          <td>
            <n-checkbox v-model:checked="n.isChecked"/>
          </td>
          <td>
            {{ i + 1 }}
          </td>
          <td>
            <NInput
              v-model:value="n.projectName"
              :placeholder="t('TEMP.Cabinet.Quotation.projectName')"
              clearable
            />
          </td>
          <td>
            <NInput
              v-model:value="n.specificationModel"
              :placeholder="t('TEMP.Cabinet.Quotation.specificationModel')"
              clearable
            />
          </td>
          <td>
            <NInputNumber
              v-model:value="n.pricingQuantity"
              :placeholder="t('TEMP.Cabinet.Quotation.pricingQuantity')"
              type="number"
              show-count
              clearable
              :precision="0"
              :show-button="false"
              style="width: 100%"
            >
            </NInputNumber>
          </td>
          <td>
            <NInputNumber
              v-model:value="n.unitPrice"
              :placeholder="t('TEMP.Cabinet.Quotation.unitPrice')"
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
            </NInputNumber>
          </td>
          <td>
            <NInputNumber
              v-model:value="n.pricingCoefficient"
              :placeholder="t('TEMP.Cabinet.Quotation.pricingCoefficient')"
              type="number"
              show-count
              clearable
              :precision="2"
              :show-button="false"
              style="width: 100%"
            >
            </NInputNumber>
          </td>
          <td>
            <NInputNumber
              v-model:value="n.priceAmount"
              :placeholder="t('TEMP.Cabinet.Quotation.priceAmount')"
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
            </NInputNumber>
          </td>
          <td>
            <NInput
              v-model:value="n.remark"
              :placeholder="t('TEMP.Cabinet.Quotation.remark')"
              clearable
            />
          </td>

        </tr>
        </tbody>

      </NTable>
      <n-divider title-placement="left" style="margin-top: 10px">
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


    <NForm
      v-else-if="quotationState === 'view'"
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

      <nGrid :cols="24">
        <NFormItemGi
          :span="8"
          path="customerName"
          :label="t('TEMP.Cabinet.Quotation.customerName')"
        >
          <NInput
            v-model:value="formData.customerName"
            disabled
          />

        </NFormItemGi>


        <NFormItemGi
          :span="16"
          path="address"
          :label="t('TEMP.Cabinet.Quotation.address')"
        >
          <NInput
            v-model:value="formData.address"
            disabled
          />

        </NFormItemGi>

      </nGrid>

      <nGrid :cols="24">
        <NFormItemGi
          :span="8"
          path="productName"
          :label="t('TEMP.Cabinet.Quotation.productName')"
        >
          <NInput
            v-model:value="formData.productName"
            disabled
          />

        </NFormItemGi>

        <NFormItemGi
          :span="8"
          path="cabinetBody"
          :label="t('TEMP.Cabinet.Quotation.cabinetBody')"
        >
          <NInput
            v-model:value="formData.cabinetBody"
            disabled
          />

        </NFormItemGi>

        <NFormItemGi
          :span="8"
          path="color"
          :label="t('TEMP.Cabinet.Quotation.color')"
        >
          <NInput
            v-model:value="formData.color"
            disabled
          />

        </NFormItemGi>

      </nGrid>

      <nGrid :cols="24">

        <NFormItemGi
          :span="8"
          path="telephone"
          :label="t('TEMP.Cabinet.Quotation.telephone')"
        >
          <NInput
            v-model:value="formData.telephone"
            disabled
          />

        </NFormItemGi>


        <NFormItemGi
          :span="8"
          path="quotationDate"
          :label="t('TEMP.Cabinet.Quotation.quotationDate')"
        >

          <n-date-picker v-model:formatted-value="formData.quotationDate" type="date" style="width: 100%" disabled/>

        </NFormItemGi>


        <NFormItemGi
          :span="8"
          path="productName"
          :label="t('TEMP.Cabinet.Quotation.allTotalPrice')"
        >
          <nInputNumber
            v-model:value="formData.allTotalPrice"
            type="number"
            disabled
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


      <div class="flex w-full items-center justify-between  sm:justify-end ">
        <n-divider title-placement="left" style="margin-top: -10px">
          {{ t('TEMP.Cabinet.Quotation.Cabinets') }}
        </n-divider>

        <n-gradient-text type="info" style="font-size: 16px;margin-top: -30px">
          橱柜类总计：{{ cabinetTotalPrice }}元
        </n-gradient-text>

        <!--          </n-divider>-->
      </div>


      <NTable :bordered="false" :single-line="false" style="margin-top: -20px" class="custom-table" size="small">
        <thead>
        <tr>
          <th style="width:15px;">
            <n-checkbox @change="checkAllCabinetsDetail"/>
          </th>
          <th style="width:20px;">
            {{ t('TEMP.Cabinet.Quotation.serialNumber') }}
          </th>
          <th>
            {{ t('TEMP.Cabinet.Quotation.projectName') }}
          </th>
          <th>
            {{ t('TEMP.Cabinet.Quotation.specificationModel') }}
          </th>
          <th>
            {{ t('TEMP.Cabinet.Quotation.pricingQuantity') }}
          </th>
          <th>
            {{ t('TEMP.Cabinet.Quotation.unitPrice') }}
          </th>
          <th>
            {{ t('TEMP.Cabinet.Quotation.pricingCoefficient') }}
          </th>
          <th>
            {{ t('TEMP.Cabinet.Quotation.priceAmount') }}
          </th>
          <th>
            {{ t('TEMP.Cabinet.Quotation.remark') }}
          </th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(n,i) in detailData.filter(m=>m.detailType==='0')" :key="i">
          <td>
            <!--            &#45;&#45;{{n.isChecked}}-->
            <n-checkbox v-model:checked="n.isChecked"/>
          </td>
          <td>
            {{ i + 1 }}
          </td>
          <td>
            <NInput
              v-model:value="n.projectName"
              disabled
            />
          </td>
          <td>
            <NInput
              v-model:value="n.specificationModel"
              disabled
            />
          </td>
          <td>
            <NInputNumber
              v-model:value="n.pricingQuantity"
              type="number"
              disabled
              :precision="2"
              :show-button="false"
              style="width: 100%"
            >
            </NInputNumber>
          </td>
          <td>
            <NInputNumber
              v-model:value="n.unitPrice"
              disabled
              type="number"
              :parse="parse"
              :format="format"
              :show-button="false"
              style="width: 100%"
            >
              <template #suffix>
                元
              </template>
            </NInputNumber>
          </td>
          <td>
            <NInputNumber
              v-model:value="n.pricingCoefficient"
              type="number"
              disabled
              :precision="2"
              :show-button="false"
              style="width: 100%"
            >
            </NInputNumber>
          </td>
          <td>
            <NInputNumber
              v-model:value="n.priceAmount"
              type="number"
              disabled
              :parse="parse"
              :format="format"
              :show-button="false"
              style="width: 100%"
            >
              <template #suffix>
                元
              </template>
            </NInputNumber>
          </td>
          <td>
            <NInput
              v-model:value="n.remark"
              disabled
            />
          </td>

        </tr>
        </tbody>

      </NTable>


      <div class="flex w-full items-center justify-between  sm:justify-end ">
        <n-divider title-placement="left" style="margin-top: 10px">
          {{ t('TEMP.Cabinet.Quotation.kitchenwareHardware') }}
        </n-divider>

        <n-gradient-text type="info" style="font-size: 16px; margin-top: -10px">
          厨具五金类总计：{{ electricalTotalPricePrice }}元
        </n-gradient-text>
        <!--          </n-divider>-->
      </div>

      <NTable :bordered="false" :single-line="false" style="margin-top: -20px;" class="custom-table" size="small">
        <thead>
        <tr>
          <th style="width:15px;">
            <n-checkbox @change="checkAllKitchenwareHardwareDetail"/>
          </th>
          <th style="width:20px;">
            {{ t('TEMP.Cabinet.Quotation.serialNumber') }}
          </th>
          <th>
            {{ t('TEMP.Cabinet.Quotation.projectName') }}
          </th>
          <th>
            {{ t('TEMP.Cabinet.Quotation.specificationModel') }}
          </th>
          <th>
            {{ t('TEMP.Cabinet.Quotation.pricingQuantity') }}
          </th>
          <th>
            {{ t('TEMP.Cabinet.Quotation.unitPrice') }}
          </th>
          <th>
            {{ t('TEMP.Cabinet.Quotation.pricingCoefficient') }}
          </th>
          <th>
            {{ t('TEMP.Cabinet.Quotation.priceAmount') }}
          </th>
          <th>
            {{ t('TEMP.Cabinet.Quotation.remark') }}
          </th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(n,i) in detailData.filter(m=>m.detailType==='1')" :key="i">
          <td>
            <n-checkbox v-model:checked="n.isChecked"/>
          </td>
          <td>
            {{ i + 1 }}
          </td>
          <td>
            <NInput
              v-model:value="n.projectName"
              disabled
            />
          </td>
          <td>
            <NInput
              v-model:value="n.specificationModel"
              disabled
            />
          </td>
          <td>
            <NInputNumber
              v-model:value="n.pricingQuantity"
              type="number"
              disabled
              :precision="0"
              :show-button="false"
              style="width: 100%"
            >
            </NInputNumber>
          </td>
          <td>
            <NInputNumber
              v-model:value="n.unitPrice"
              type="number"
              disabled
              :parse="parse"
              :format="format"
              :show-button="false"
              style="width: 100%"
            >
              <template #suffix>
                元
              </template>
            </NInputNumber>
          </td>
          <td>
            <NInputNumber
              v-model:value="n.pricingCoefficient"
              type="number"
              disabled
              :precision="2"
              :show-button="false"
              style="width: 100%"
            >
            </NInputNumber>
          </td>
          <td>
            <NInputNumber
              v-model:value="n.priceAmount"
              type="number"
              disabled
              :parse="parse"
              :format="format"
              :show-button="false"
              style="width: 100%"
            >
              <template #suffix>
                元
              </template>
            </NInputNumber>
          </td>
          <td>
            <NInput
              v-model:value="n.remark"
              disabled
            />
          </td>

        </tr>
        </tbody>

      </NTable>
      <n-divider title-placement="left" style="margin-top: 10px">
        {{ t('TEMP.Cabinet.Quotation.attachFiles') }}
      </n-divider>

      <n-upload
        v-model:file-list="fileList"
        multiple
        :max="10"
        style="margin-top: -30px"
        disabled
        show-download-button
        @download="handleDownload"
      >
        <!--        <n-upload-dragger>-->
        <!--          <div style="margin-bottom: 12px">-->
        <!--            <n-icon size="48" :depth="3">-->
        <!--              <archive-icon />-->
        <!--            </n-icon>-->
        <!--          </div>-->
        <!--          <n-text style="font-size: 16px">-->
        <!--            点击或者拖动文件到该区域来上传-->
        <!--          </n-text>-->
        <!--          <n-p depth="3" style="margin: 8px 0 0 0">-->
        <!--            请不要上传敏感数据，比如你的银行卡号和密码，信用卡号有效期和安全码-->
        <!--          </n-p>-->
        <!--        </n-upload-dragger>-->
      </n-upload>

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
</style>
