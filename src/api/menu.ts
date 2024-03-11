import type {BasePageModel} from '@/constants'
import type {BaseResponse,ResponseResult} from '@/types'
import type {Menu,MenuRoleAndChildren} from '@/types/api/menu'

export class MenuAPI {
  private static MENU_API_PREFIX = `${GlobalEnvConfig.BASE_API_PREFIX}/menu`


  // 分页菜单列表
  static list(params: BasePageModel) {
    return httpRequest.get<BaseResponse<Menu>>(this.MENU_API_PREFIX, {
      ...params
    })
  }


  static listOnlyMenu(params: BasePageModel) {
    return httpRequest.get<BaseResponse<Menu>>(`${this.MENU_API_PREFIX}/only-menu`, {
      ...params
    })
  }


  static menuByParentId(menuId: unknown) {
    return httpRequest.get<BaseResponse<Menu>>(`${this.MENU_API_PREFIX}/${menuId}/children-menu`)
  }


  static reviseMenuSortById(menuId: unknown,sort: unknown) {
    return httpRequest.put<ResponseResult>(`${this.MENU_API_PREFIX}/${menuId}/revise-menusort`,{
      sort
    })
  }

  static update(menuId: string, data: Menu) {
    return httpRequest.patch<ResponseResult>(`${this.MENU_API_PREFIX}/${menuId}`, {
      ...data
    })
  }

  static create( data: Menu) {
    return httpRequest.post<ResponseResult>(`${this.MENU_API_PREFIX}`, {
      ...data
    })
  }

  static delete(menuId: string) {
    return httpRequest.patch<ResponseResult>(`${this.MENU_API_PREFIX}/${menuId}/delete-menu`)
  }


  static allMenuAneChildren() {
    return httpRequest.get<BaseResponse<MenuRoleAndChildren>>(`${this.MENU_API_PREFIX}/all-menu-children`)
  }

  static allMenuIdByRoleId(roleId: string){
    return httpRequest.get<ResponseResult<[]>>(`${this.MENU_API_PREFIX}/${roleId}/all-menuid-by-roleid`)
  }


  static addMenuIdByRoleId(roleId: string,menuIds: object) {
    return httpRequest.post<ResponseResult>(`${this.MENU_API_PREFIX}/${roleId}/add-menuid-by-roleid`,{
      ...menuIds
    })
  }

}
