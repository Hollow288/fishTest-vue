import type {BasePageModel} from '@/constants'
import type {ResponseResult} from '@/types'
import type {Notice} from '@/types/api/notice'
import type {CabinetQuotation} from '@/types/api/cabinetQuotation'

export class CabinetRelatedAPI {
  private static CABINET_API_PREFIX = `${GlobalEnvConfig.BASE_API_PREFIX}/cabinet`


  // 分页菜单列表
  static list(params: BasePageModel) {
    return httpRequest.get<ResponseResult>(`${this.CABINET_API_PREFIX}/quotation`, {
      ...params
    })
  }


  static create(cabinetQuotation: CabinetQuotation) {
    return httpRequest.post<ResponseResult>(`${this.CABINET_API_PREFIX}/quotation`, {...cabinetQuotation})
  }


  static getDetailDataByQuotationId(quotationId: string) {
    return httpRequest.get<ResponseResult>(`${this.CABINET_API_PREFIX}/${quotationId}/all-detail-by-quotationId`)
  }


  static getAttachDataByQuotationId(quotationId: string) {
    return httpRequest.get<ResponseResult>(`${this.CABINET_API_PREFIX}/${quotationId}/all-attach-by-quotationId`)
  }



}
