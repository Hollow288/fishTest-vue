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
}
