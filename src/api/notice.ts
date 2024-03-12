import type {BasePageModel} from '@/constants'
import type {ResponseResult} from '@/types'

export class NoticeAPI {
  private static NOTICE_API_PREFIX = `${GlobalEnvConfig.BASE_API_PREFIX}/notice`


  // 分页菜单列表
  static list(params: BasePageModel) {
    return httpRequest.get<ResponseResult>(this.NOTICE_API_PREFIX, {
      ...params
    })
  }


  static allUsersByNoticeId(noticeId: string) {
    return httpRequest.get<ResponseResult>(`${this.NOTICE_API_PREFIX}/${noticeId}/all-userid-by-noticeid`)
  }



}
