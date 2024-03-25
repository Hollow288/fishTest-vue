import type {BasePageModel} from '@/constants'
import type {ResponseResult} from '@/types'
import type {Notice} from '@/types/api/notice'

export class CabinetRelatedAPI {
  private static CABINET_API_PREFIX = `${GlobalEnvConfig.BASE_API_PREFIX}/cabinet`


  // 分页菜单列表
  static list(params: BasePageModel) {
    return httpRequest.get<ResponseResult>(`${this.CABINET_API_PREFIX}/quotation`, {
      ...params
    })
  }



}
