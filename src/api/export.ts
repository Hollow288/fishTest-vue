
export class ExportAPI {
  private static EXPORT_API_PREFIX = `${GlobalEnvConfig.BASE_API_PREFIX}/export`



  static getExportQuotation(quotationId: string){
    return httpRequest.get(`${this.EXPORT_API_PREFIX}/${quotationId}/quotation`, {}, {responseType: 'blob' })
  }



}
