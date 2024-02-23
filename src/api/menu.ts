import type {BasePageModel} from '@/constants'
import type {BaseResponse} from '@/types'
import type {Menu} from '@/types/api/menu'

export class MenuAPI {
  private static USER_API_PREFIX = `${GlobalEnvConfig.BASE_API_PREFIX}/menu`


  // 分页菜单列表
  static list(params: BasePageModel) {
    return httpRequest.get<BaseResponse<Menu>>(this.USER_API_PREFIX, {
      ...params
    })
  }


  static menuByParentId(menuId: unknown) {
    return httpRequest.get<BaseResponse<Menu>>(`${this.USER_API_PREFIX}/${menuId}/children-menu`)
  }

}
