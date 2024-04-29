import type {BasePageModel} from '@/constants'
import type {PageResponse,ResponseResult} from '@/types'
import type {CabinetQuotation} from '@/types/api/cabinetQuotation'
import {OrderStatus} from "@/types/api/orderStatus";

export class CabinetRelatedAPI {
  private static CABINET_API_PREFIX = `${GlobalEnvConfig.BASE_API_PREFIX}/cabinet`


  // 分页菜单列表
  static listQuotation(params: BasePageModel) {
    return httpRequest.get<ResponseResult>(`${this.CABINET_API_PREFIX}/quotation`, {
      ...params
    })
  }


  static listPortfolioWeb(params: BasePageModel) {
    return httpRequest.post<PageResponse>(`${this.CABINET_API_PREFIX}/portfolio-web`, {
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


  static deleteQuotations(quotationIds: object) {
    return httpRequest.patch<ResponseResult>(`${this.CABINET_API_PREFIX}/delete-quotations`, {...quotationIds})
  }

  static deletePortfolioWeb(quotationIds: object) {
    return httpRequest.patch<ResponseResult>(`${this.CABINET_API_PREFIX}/delete-portfolio-web`, {...quotationIds})
  }

  static getPortFolioType(){
    return httpRequest.get<ResponseResult>(`${this.CABINET_API_PREFIX}/port-folio-type`)
  }


  static editPortFolioType(formData:object){
    return httpRequest.put<ResponseResult>(`${this.CABINET_API_PREFIX}/port-folio-type`,{...formData})
  }


  static addPortfolio(formData:object){
    return httpRequest.post<ResponseResult>(`${this.CABINET_API_PREFIX}/port-folio`, {...formData})
  }


  static addNewsInformation(formData:object){
    return httpRequest.post<ResponseResult>(`${this.CABINET_API_PREFIX}/news-information`, {...formData})
  }

  static newsInformationList(params: BasePageModel) {
    return httpRequest.get<PageResponse>(`${this.CABINET_API_PREFIX}/news-information-list`, {
      ...params
    })
  }


  static editNewsInformation(formData:object){
    return httpRequest.put<ResponseResult>(`${this.CABINET_API_PREFIX}/news-information`,{...formData})
  }


  static deleteNewsInformation(newsIds: object) {
    return httpRequest.patch<ResponseResult>(`${this.CABINET_API_PREFIX}/delete-news-information`, {...newsIds})
  }


  static messageBoardList(params: BasePageModel) {
    return httpRequest.get<PageResponse>(`${this.CABINET_API_PREFIX}/message-board-list`, {
      ...params
    })
  }


  static deleteMessageBoard(messageIds: object) {
    return httpRequest.patch<ResponseResult>(`${this.CABINET_API_PREFIX}/delete-message-board`, {...messageIds})
  }


  static editOrganizationWork(args:object){
    return httpRequest.post<ResponseResult>(`${this.CABINET_API_PREFIX}/edit-organization-work`, {...args})
  }


  static getInfoByYearMonthDate(year:object,month:object,date:object) {
    return httpRequest.get<PageResponse>(`${this.CABINET_API_PREFIX}/info-schedule`, {
      year,
      month,
      date
    })
  }


  static listTodos(year:object,month:object) {
    return httpRequest.get<PageResponse>(`${this.CABINET_API_PREFIX}/list-todos`, {
      year,
      month
    })
  }


  static autoOrderStatus(quotationId:object){
    return httpRequest.post<ResponseResult>(`${this.CABINET_API_PREFIX}/auto-order-status`, {...quotationId})
  }


  static listOrderStatus(params: BasePageModel) {
    return httpRequest.get<ResponseResult>(`${this.CABINET_API_PREFIX}/order-status`, {
      ...params
    })
  }


  static createOrderStatus(formData:object){
    return httpRequest.post<ResponseResult>(`${this.CABINET_API_PREFIX}/create-order-status`, {...formData})
  }

  static getAttachDataByOrderId(orderId: string) {
    return httpRequest.get<ResponseResult>(`${this.CABINET_API_PREFIX}/${orderId}/all-attach-by-orderId`)
  }

  static updateOrderStatus(orderStatus: OrderStatus,orderId: string){
    return httpRequest.put<ResponseResult>(`${this.CABINET_API_PREFIX}/${orderId}/update-order-status`, {...orderStatus})
  }


  static removeOrderStatusAttachs(attachIds: object){
    return httpRequest.put<ResponseResult>(`${this.CABINET_API_PREFIX}/remove-order-status-attach`, {...attachIds})
  }

  static deleteOrderStatusByIds(orderIds: object) {
    return httpRequest.patch<ResponseResult>(`${this.CABINET_API_PREFIX}/delete-order-status`, {...orderIds})
  }


  static addArrivedPrice(checkData: object,orderId: string){
    return httpRequest.put<ResponseResult>(`${this.CABINET_API_PREFIX}/${orderId}/add-arrived-price`, {...checkData})
  }
}
