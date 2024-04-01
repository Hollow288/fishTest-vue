import type {BasePageModel} from '@/constants'
import type {ResponseResult} from '@/types'
import type {CabinetQuotation} from '@/types/api/cabinetQuotation'

export class CabinetRelatedAPI {
  private static CABINET_API_PREFIX = `${GlobalEnvConfig.BASE_API_PREFIX}/cabinet`


  // 分页菜单列表
  static listQuotation(params: BasePageModel) {
    return httpRequest.get<ResponseResult>(`${this.CABINET_API_PREFIX}/quotation`, {
      ...params
    })
  }


  static createQuotation(cabinetQuotation: CabinetQuotation) {
    return httpRequest.post<ResponseResult>(`${this.CABINET_API_PREFIX}/quotation`, {...cabinetQuotation})
  }


  static getDetailDataByQuotationId(quotationId: string) {
    return httpRequest.get<ResponseResult>(`${this.CABINET_API_PREFIX}/${quotationId}/all-detail-by-quotationId`)
  }


  static getAttachDataByQuotationId(quotationId: string) {
    return httpRequest.get<ResponseResult>(`${this.CABINET_API_PREFIX}/${quotationId}/all-attach-by-quotationId`)
  }

  static getDownloadQuotation(quotationId: string){
    return httpRequest.get<ResponseResult>(`${this.CABINET_API_PREFIX}/${quotationId}/all-attach-by-quotationId`)
  }


  static removeQuotationAttachs(attachIds: object){
    return httpRequest.put<ResponseResult>(`${this.CABINET_API_PREFIX}/remove-quotation-attach`, {...attachIds})
  }


  static updateQuotation(cabinetQuotation: CabinetQuotation,quotationId: string){
    return httpRequest.put<ResponseResult>(`${this.CABINET_API_PREFIX}/${quotationId}/update-quotation`, {...cabinetQuotation})
  }


  static delete(quotationIds: object) {
    return httpRequest.patch<ResponseResult>(`${this.CABINET_API_PREFIX}/delete-quotations`, {...quotationIds})
  }



}
