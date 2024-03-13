<script setup lang="ts">
import type { MessageSchema } from '@/types'
import NotificationIcon from '~icons/ic/baseline-notifications-none'

const { t } = useI18n<{ message: MessageSchema }>()

const userStore = useUserStore()

const messageCount = ref(0)
const list = ref<any>([])
const NMessage = useMessage()
// let responseList = ref<any>([])

const notification = useNotification()

const handleClickNotification = () => {
  if (list.value.length > 0) {
    list.value.forEach((item: any) => {
      debugger
      console.log(item)
      const n = notification.create({
          title: '你的新通知:',
          description: item.name,
          content: item.message ,
          meta:  TimeUtils.formatTime(item.releaseDate, 'YYYY-MM-DD HH:mm:ss'),
          avatar: () =>
            h(NAvatar, {
              size: 'small',
              round: true,
              src: item.avatarUrl
            }),
          action: () =>
            h(
              NButton,
              {
                text: true,
                type: 'success',
                onClick: () => {
                  // BrowserUtils.openNewWindow(REPO_GITHUB_URL)
                  // MenuAPI.
                  n.destroy()
                }
              },
              {
                default: () => `${t('COMMON.Read')}`
              }
          ),
          onAfterLeave: () => {
            NMessage.success("Wouldn't it be Nice")
          }
        })
        list.value = list.value.filter((i: any) => i.message !== item.message)
        messageCount.value -= 1
    })
  }
}

onMounted(async () => {
  // const eventSource = new EventSource(`/fish-api/sse/notification?userId=${userStore.user.userId}`)
  // eventSource.addEventListener('notification', ({ data, type }) => {
  //   console.log(data, type)
  //   if (type === 'notification') {
  //     messageCount.value += 1
  //     list.value.push(JSON.parse(data))
  //   }
  // })

  const {code, data} = await NoticeAPI.noticesByUserId(userStore.user.userId)
  if (code == 200) {
      list.value = data
      messageCount.value = list.value.length
  }

})
</script>

<template>
  <NPopover trigger="click">
    <template #trigger>
      <NTooltip
        placement="bottom"
        trigger="hover"
      >
        <template #trigger>
          <NIcon
            class="cursor-pointer"
            size="20"
            @click="handleClickNotification"
          >
            <NBadge
              :value="messageCount"
              type="default"
              processing
              show-zero
              class="!absolute -right-3 -top-2 scale-[0.7]"
            />
            <NotificationIcon />
          </NIcon>
        </template>
        {{ t('COMMON.NOTIFICATION') }}
      </NTooltip>
    </template>
  </NPopover>
</template>
