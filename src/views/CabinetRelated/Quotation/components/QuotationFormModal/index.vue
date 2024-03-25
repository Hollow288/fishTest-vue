<script setup lang="ts">
// Todo 为什么这样的引入不行？
// import {Eye20Regular as ViewIcon20Regular} from '@vicons/fluent'
// import Eye16Regular from '@vicons/fluent/Eye16Regular'
import type {FormInst, FormRules, FormValidationError} from 'naive-ui'
import {AddSharp, TrashBinOutline} from '@vicons/ionicons5'

import type {MessageSchema} from '@/types'
import type {CabinetQuotation} from '@/types/api/cabinetQuotation'
import CreateIcon from '~icons/ic/sharp-add'
import EditIcon from '~icons/ic/sharp-edit'
import ViewIcon from '~icons/mdi/file-search-outline'

export interface Props {
  quotationFormData?: CabinetQuotation
  quotationState: string
}

const props = defineProps<Props>()

const loadingRef = ref(true)

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
      const {message, code} = await NoticeAPI.update(formData.value.noticeId, formData.value)
      if (code == 200) {
        NMessage.success(message!)
        showModal.value = false
        emit('save')
      } else {
        NMessage.error(message!)
      }
    } catch (err: any) {
      if (err.message) {
        NMessage.error(err.message)
      }
    }
  } else {
    try {
      const {message, code} = await NoticeAPI.create(formData.value)
      if (code == 200) {
        NMessage.success(message!)
        showModal.value = false
        emit('save')
      } else {
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


const handlePublish = async () => {
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
      // 修改并发布新通知
      const {message, code} = await NoticeAPI.updateAndPublishNotice(formData.value.noticeId, formData.value)
      if (code == 200) {
        NMessage.success(message!)
        showModal.value = false
        emit('save')
      } else {
        NMessage.error(message!)
      }
    } catch (err: any) {
      if (err.message) {
        NMessage.error(err.message)
      }
    }
  } else {
    try {
      // 创建并发布新通知
      const {message, code} = await NoticeAPI.createAndPublishNotice(formData.value)
      if (code == 200) {
        NMessage.success(message!)
        showModal.value = false
        emit('save')
      } else {
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

const parse = (input: string) => {
  const nums = input.replace(/,/g, '').trim()
  if (/^\d+(\.(\d+)?)?$/.test(nums)) return Number(nums)
  return nums === '' ? null : Number.NaN
}

const format = (value: number | null) => {
  if (value === null) return ''
  return value.toLocaleString('en-US')
}


const actonTest = () => h(
  'div',
  {
    class: 'space-x-3 flex justify-center',
    style: 'margin-top: 10px'
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
          handlePublish()
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
  () => props.quotationFormData,
  async (newValue) => {
    if (newValue && typeof newValue.noticeId !== 'undefined') {
      formData.value = {
        ...newValue,
      }
      loadingRef.value = true
      // const {code:code2, data:data2} = await NoticeAPI.allUsersByNoticeId(newValue.noticeId)
      // if(code1 == 200 && code2 == 200){
      //   options.value = data1
      //   formData.value.userIds = data2
      //   loadingRef.value = false
      // }else {
      //   loadingRef.value = false
      //   NMessage.error('数据读取错误')
      //   return
      // }
    } else {
      // const {data:data1} = await UserAPI.allUserRole()
      // options.value = data1
      // noticeFormData.value.noticeId = null
      // noticeFormData.value.message = null
      // noticeFormData.value.userIds = []
      // formData.value = noticeFormData.value
      // // console.log(formData.value)

    }
  },
  {immediate: true}
)

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
      class="flex flex-col"
      label-placement='left'
    >

      <nGrid :cols="24">
        <NFormItemGi
          :span="12"
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
          :span="12"
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
      </nGrid>


      <nGrid :cols="24">
        <NFormItemGi
          :span="24"
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
          path="quotationDate"
          :label="t('TEMP.Cabinet.Quotation.quotationDate')"
        >

          <n-date-picker v-model:value="formData.quotationDate" type="date" style="width: 100%"/>

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


      <div class=" justify-between space-x-3" style="margin-top: -20px">

        <n-button secondary strong>
          <template #icon>
            <n-icon :component="AddSharp">
              <!--                <AddSharp-icon />-->
            </n-icon>
          </template>
          {{ t('COMMON.Create') }}
        </n-button>

        <!--        @click="deleteNotices"-->
        <n-button secondary strong>
          <template #icon>
            <n-icon :component="TrashBinOutline">
            </n-icon>
          </template>
          {{ t('COMMON.DELETE') }}
        </n-button>

      </div>


      <NTable :bordered="false" :single-line="false" style="margin-top: 5px" >
        <thead>
        <tr>
          <th style="width:15px;">
            <n-checkbox />
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
        <tr>
          <td>
            <n-checkbox />
          </td>
          <td>
            {{1}}
          </td>
          <td>
            <NInput
              v-model:value="formData.address"
              :placeholder="t('TEMP.Cabinet.Quotation.address')"
              maxlength="100"
              show-count
              clearable
            />
          </td>
          <td>
            反常的
          </td>
          <td>
            反常的
          </td>
          <td>
            反常的
          </td>
          <td>
            反常的
          </td>
          <td>
            反常的
          </td>
          <td>
            反常的
          </td>

        </tr>
        </tbody>

      </NTable>


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
