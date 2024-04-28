import type { BaseResponse } from '@/types'

export class UploadAPI {
  private static UPLOAD_API_PREFIX = `${GlobalEnvConfig.BASE_API_PREFIX}/upload`

  private static headers = { 'Content-Type': 'multipart/form-data' }

  /**
   * 上传文件
   * @param data 文件数据
   * @param options 上传配置
   *
   * @todo 进度条功能暂未实现
   */
  static uploadFile(data: any, options?: any) {
    return httpRequest.post<BaseResponse<{ path: string }>>(this.UPLOAD_API_PREFIX, data, {
      headers: this.headers,
      onUploadProgress: options?.onUploadProgress ? options.onUploadProgress : () => {}
    })
  }


  /**
   * 上传文件
   * @param data 文件数据
   * @param options 上传配置
   *
   * @todo 进度条功能暂未实现
   */
  static uploadAvatarFile(data: any, options?: any) {
    return httpRequest.post<BaseResponse<{ path: string }>>(`${this.UPLOAD_API_PREFIX}/avatar`, data, {
      headers: this.headers,
      onUploadProgress: options?.onUploadProgress ? options.onUploadProgress : () => {}
    })
  }




  /**
   * 上传文件
   * @param data 文件数据
   * @param quotationId
   *
   * @todo 进度条功能暂未实现
   */
  static uploadQuotationFile(data: any, quotationId: any) {
    return httpRequest.post<BaseResponse<{ path: string }>>(`${this.UPLOAD_API_PREFIX}/${quotationId}/quotation`, data, {
      headers: this.headers
    })
  }

  static uploadPortFolioThumbnailFile(data: any, folioId: any) {
    return httpRequest.post<BaseResponse<{ path: string }>>(`${this.UPLOAD_API_PREFIX}/${folioId}/portfolio-thumbnail`, data, {
      headers: this.headers
    })
  }

  static uploadPortFolioPanoramaFile(data: any, folioId: any) {
    return httpRequest.post<BaseResponse<{ path: string }>>(`${this.UPLOAD_API_PREFIX}/${folioId}/portfolio-panorama`, data, {
      headers: this.headers
    })
  }


  static uploadNewsInformationFile(data: any, newsId: any) {
    return httpRequest.post<BaseResponse<{ path: string }>>(`${this.UPLOAD_API_PREFIX}/${newsId}/news-information`, data, {
      headers: this.headers
    })
  }


  static uploadOrderStatusFile(data: any, orderId: any) {
    return httpRequest.post<BaseResponse<{ path: string }>>(`${this.UPLOAD_API_PREFIX}/${orderId}/order-status`, data, {
      headers: this.headers
    })
  }

  /**
   * 批量上传文件
   * @param data 文件数据
   * @param options 上传配置
   *
   * @todo 进度条功能暂未实现
   */
  static uploadFiles(data: any) {
    return httpRequest.post(`${this.UPLOAD_API_PREFIX}/batch`, data, {
      headers: this.headers
    })
  }
}
