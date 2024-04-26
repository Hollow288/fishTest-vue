<script lang="ts">
import { addDays} from 'date-fns/esm'
import { useMessage } from 'naive-ui'
import {defineComponent, ref} from 'vue'
import {ToDosFormModal} from './components'

const toDosFormModalRef = ref()
const toDosData = ref({})
const thisYear = ref(0)
const thisMonth  = ref(0)
const thisDate = ref(0)
const toDosList = ref([])

const queryList = (year,month) => {

  CabinetRelatedAPI.listTodos(year,month).then((result => {
    toDosList.value = result.data
  }))
}
export default defineComponent({
  components: {
    ToDosFormModal
  },
  setup () {

    const message = useMessage()
    return {
      thisYear,
      thisMonth,
      thisDate,
      toDosFormModalRef,
      toDosData,
      queryList,
      value: ref(addDays(Date.now(), 1).valueOf()),
      handleUpdateValue (
        timestamp: number,
        { year, month, date }: { year: number; month: number; date: number }
      ) {

        // message.success(`${year}-${month}-${date}`)
        thisYear.value = year
        thisMonth.value = month
        thisDate.value = date
        toDosFormModalRef.value.handleShowModal()
      },
      isHaveToDos( year, month, date){
        return toDosList.value.find((item) => item.year === year && item.month === month && item.date === date)
      },
      updateTodos(info: { year: number, month: number }){
        queryList(info.year,info.month)
      }
    }
  },
  mounted(){
    queryList(new Date().getFullYear(),new Date().getMonth()+1)
  }
})
</script>


<template>
  <main class="flex h-[calc(100%-144px)] flex-col">
    <n-card class="flex h-full">
      <n-calendar
        v-model:value="value"
        style="height:100%"
        #="{ year, month, date }"
        :on-panel-change="updateTodos"
        @update:value="handleUpdateValue"
      >
        <div v-if="isHaveToDos(year,month,date)" :style="{ height: 'calc(100% - 15px)', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }">
            <div :style="{height: '100%',display: 'flex', flexDirection: 'column', justifyContent: 'center'}">

              <span style="display: block; width: 100%;color: orange;">{{year}}-{{month}}-{{date}}</span>
              <span style="display: block; width: 100%;color: orange;">代办事项</span>

            </div>

        </div>

      </n-calendar>
    </n-card>

    <ToDosFormModal
      ref="toDosFormModalRef"
      :year="thisYear"
      :month="thisMonth"
      :date="thisDate"
      @save="queryList(thisYear,thisMonth)"
    />
  </main>

</template>

