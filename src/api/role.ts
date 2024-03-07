import type {BasePageModel} from '@/constants'
import type {ResponseResult} from '@/types'
import {Menu, Role} from "@/types";

export class RoleAPI {
  private static ROLE_API_PREFIX = `${GlobalEnvConfig.BASE_API_PREFIX}/role`


  // 分页菜单列表
  static list(params: BasePageModel) {
    return httpRequest.get<ResponseResult>(this.ROLE_API_PREFIX, {
      ...params
    })
  }

  static create( data: Role) {
    return httpRequest.post<ResponseResult>(`${this.ROLE_API_PREFIX}`, {
      ...data
    })
  }

  static update(roleId: string, data: Role) {
    return httpRequest.patch<ResponseResult>(`${this.ROLE_API_PREFIX}/${roleId}`, {
      ...data
    })
  }


  static delete(roleIds: string[]) {
    return httpRequest.patch<ResponseResult>(`${this.ROLE_API_PREFIX}/delete-roles`,{
      ...roleIds
    })
  }


}
