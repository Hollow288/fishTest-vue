export class RenderUtils {
  /**
   * 渲染菜单文本
   * @param label 文本值
   */
  static renderMenuLabel(label: string | (() => string)) {
    return () =>
      h(
        NEllipsis,
        {
          tooltip: {
            placement: 'right',
            showArrow: false
          }
        },
        {
          default: label
        }
      )
  }

  /**
   * 渲染图标
   * @param icon 图标
   * @param size 图标大小
   */
  static async renderIcon(icon: any, size: number = 16, options?: any) {
  // static renderIcon(icon: any, size: number = 16, options?: any) {

    // // 动态导入图标模块
    // const iconModule = await  import(icon)
    // debugger
    // // 获取图标组件
    // const iconComponent = iconModule.default

    return () =>
      h(
        NIcon,
        {
          size,
          ...options
        },
        {
          default: () => h(icon)
        }
      )
  }
}
