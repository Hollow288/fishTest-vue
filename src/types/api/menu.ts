export interface Menu {
    menuId?: string
    keyName?: string
    title?: string
    label?: string
    sort?: number
    path?: string
    component?: string
    visible?: string
    status?: string
    perms?: string
    icon?: string
    createBy?: string
    createTime?: string
    updateBy?: string
    updateTime?: string
    delFlag?: string
    remark?: string
    disableAuth?: string
    dismissTab?: string
    routerParentId?: string
    menuParentId?: string
    isLeaf?: string
    children?: Menu[]
}
