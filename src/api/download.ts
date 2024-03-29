// import type {ResponseResult} from '@/types'


export class DownloadAPI {
  private static DOWNLOAD_API_PREFIX = `${GlobalEnvConfig.BASE_API_PREFIX}/download`



  static getDownloadQuotation(quotationId: string){
    // return httpRequest.get(`${this.DOWNLOAD_API_PREFIX}/${quotationId}/quotation`)
    return httpRequest.get(`${this.DOWNLOAD_API_PREFIX}/${quotationId}/quotation`, {}, {responseType: 'blob' })

  }



}
