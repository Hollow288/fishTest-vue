import { cloneDeep } from 'lodash-es'

export class CommonUtils{
  static insertOneRow<T>(objs: T[], basicObj: T): T[] {
    // 在此方法中使用 basicObj 的类型 T 来确定返回数组中元素的类型
    const temObj = cloneDeep(basicObj)
    objs.push(temObj)
    return objs
  }


  static deleteSelectedRows<T>(objs: T[]): T[] {
    // 在此方法中使用 basicObj 的类型 T 来确定返回数组中元素的类型
    objs = objs.filter(m=>m.isChecked === 'Y')
    return objs.concat(objs)
  }

  static checkAllDetail(objs,checked:boolean){
    objs.value.forEach((item:object) => {
      item.isChecked = !!checked
    })
  }
}

const mousedown = (targetEl: HTMLElement, draggableEl: HTMLElement) => {
  targetEl.onmousedown = (event: MouseEvent) => {
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight
    const { width, height, x: minMoveX, y: minMoveY } = draggableEl.getBoundingClientRect()
    const maxMoveX = viewportWidth - width - minMoveX
    const maxMoveY = viewportHeight - height - minMoveY
    const { clientX: originX, clientY: originY } = event
    const { left, top } = draggableEl.style
    const styleLeft = left?.replace('px', '') ?? 0
    const styleTop = top.replace('px', '') ?? 0

    document.onmousemove = (e: MouseEvent) => {
      const { clientX, clientY } = e
      let moveX = clientX - originX
      let moveY = clientY - originY
      if (moveX > maxMoveX) {
        moveX = maxMoveX
      } else if (-moveX > minMoveX) {
        moveX = -minMoveX
      }
      if (moveY > maxMoveY) {
        moveY = maxMoveY
      } else if (-moveY > minMoveY) {
        moveY = -minMoveY
      }
      draggableEl.style.cssText += `;left:${+styleLeft + moveX}px;top:${+styleTop + moveY}px`
    }
  }
}

const mouseup = () => {
  document.onmouseup = () => {
    document.onmousemove = null
  }
}

export const useDragModal = (draggableEl: HTMLElement, childrenSelectors : string) => {
  const targetEl = draggableEl.querySelector(childrenSelectors) as HTMLElement
  if (!targetEl) {
    return
  }
  targetEl.style.cursor = 'move'
  targetEl.style.userSelect = 'none'
  mousedown(targetEl as HTMLElement, draggableEl)
  mouseup()
}

