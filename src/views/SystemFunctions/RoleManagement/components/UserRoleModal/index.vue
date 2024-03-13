<script setup lang="ts">
import type {FormInst,FormValidationError,TransferRenderTargetLabel } from 'naive-ui'

import type { MessageSchema, Role, UserRole} from '@/types'
import EditIcon from '~icons/ic/sharp-edit'

const loadingRef = ref(true)

export interface Props {
  userRoleData?: Role
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'save'): void
}>()

const { t } = useI18n<{ message: MessageSchema }>()

const NMessage = useMessage()
const [submitLoading, submitLoadingDispatcher] = useLoading()

const formRef = ref<FormInst | null>(null)

const showModal = ref(false)

const options = ref<UserRole[]>([])

const result = ref([])



// const options = [
//   {
//     label: '07akioni',
//     value: 'https://avatars.githubusercontent.com/u/18677354?s=60&v=4'
//   },
//   {
//     label: 'amadeus711',
//     value: 'https://avatars.githubusercontent.com/u/46394163?s=60&v=4'
//   },
//   {
//     label: 'Talljack',
//     value: 'https://avatars.githubusercontent.com/u/34439652?s=60&v=4'
//   },
//   {
//     label: 'JiwenBai',
//     value: 'https://avatars.githubusercontent.com/u/43430022?s=60&v=4'
//   },
//   {
//     label: 'songjianet',
//     value: 'https://avatars.githubusercontent.com/u/19239641?s=60&v=4'
//   },
//   {
//     label: 'songjianet',
//     value: 'https://avatars.githubusercontent.com/u/19239641?s=60&v=4'
//   },
//   {
//     label: 'songjianet',
//     value: 'https://avatars.githubusercontent.com/u/19239641?s=60&v=4'
//   }
// ]



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

  try {
    const args = {userIds:result.value}
    const {code,message} = await RoleAPI.addUsersRole(props.userRoleData.roleId,args)
    if(code == 200){
      NMessage.success(message)
      showModal.value = false
    }else{
      NMessage.error(message)
    }
  } catch (err: any) {
    if (err.message) {
      NMessage.error(err.message)
    }
  }
  emit('save')
  submitLoadingDispatcher.loaded()
  return true
}


const renderSourceLabel: TransferRenderTargetLabel = function ({ option }) {
  return h(
    'div',
    {
      style: {
        display: 'flex',
        margin: '6px 0'
      }
    },
    {
      default: () => [
        h(NAvatar, {
          round: true,
          src: option.avatarUrl as string,
          size: 'small',
          fallbackSrc:
            'https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg'
        }),
        h(
          'div',
          {
            style: {
              display: 'flex',
              marginLeft: '6px',
              alignSelf: 'center'
            }
          },
          {default: () => option.label}
        )
      ]
    }
  )
}




const renderTargetLabel: TransferRenderTargetLabel = function ({ option }) {
  return h(
    'div',
    {
      style: {
        display: 'flex',
        margin: '6px 0'
      }
    },
    {
      default: () => [
        h(NAvatar, {
          round: true,
          src: option.avatarUrl as string,
          size: 'small',
          fallbackSrc:
            'https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg'
        }),
        h(
          'div',
          {
            style: {
              display: 'flex',
              marginLeft: '6px',
              alignSelf: 'center'
            }
          },
          {default: () => option.label}
        )
      ]
    }
  )
}


// const filterUsers = (pattern: string, option: TransferOption, from: 'source' | 'target'): boolean=>{
//
//   console.log(pattern)
//   console.log(option)
//   console.log(from)
//   return true
// }

const handleCancel = () => {
  showModal.value = false
  emit('save')
}

/**
 * @todo 重构
 * 使用参数传递的方式，不要用 defineExpose 暴露方法给父组件
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handleShowModal = () => {
  showModal.value = true
  emit('save')
}

watch(
  () => props.userRoleData,
  async (newValue) => {
    if (newValue && typeof newValue.roleId !== 'undefined') {
      loadingRef.value = true
      const {code:code1, data:data1} = await UserAPI.allUserRole()
      const {code:code2, data:data2} = await UserAPI.allUserByRole(newValue.roleId)

      if(code1 == 200 && code2 == 200){
        options.value = data1
        result.value = data2
        loadingRef.value = false
      }else {
        loadingRef.value = false
        NMessage.error('数据读取错误')
        return
      }

    } else {

    }
  },
  { immediate: true }
)



defineExpose({
  handleShowModal
})


onMounted(() => {
  console.log("子组件的挂载被调用")
})
</script>

<template>
  <NModal
    v-model:show="showModal"
    class="!my-6 sm:!w-[800px] "
    preset="dialog"
    :title="t('TEMP.RoleManagement.EditUserRole')"
    :loading="submitLoading"
    :positive-text="t('COMMON.Confirm')"
    :negative-text="t('COMMON.Cancel')"
    @positive-click="handleSubmit"
    @negative-click="handleCancel"
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
      class="flex flex-col "
    >

      <nGrid :cols="24" >
        <NFormItemGi :span="24"
                     path="roleKey"
                     :label="t('TEMP.RoleManagement.roleKey')"
                     :show-label ="false"
        >

          <n-transfer
            ref="transfer"
            style="height:500px"
            v-model:value="result"
            :options="options"
            :render-source-label="renderSourceLabel"
            :render-target-label="renderTargetLabel"
            source-filterable
            target-filterable
            source-title="可选人员"
            target-title="已选人员"
          />
<!--          :filter="filterUsers"-->

        </NFormItemGi>
      </nGrid>
    </NForm>
  </NModal>
</template>


