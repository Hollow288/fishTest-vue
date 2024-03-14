import type {BasePageModel} from '@/constants'
import type {ResponseResult} from '@/types'
import type {Notice} from '@/types/api/notice'
import {Role} from "@/types";

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


  static create(notice: Notice) {
    return httpRequest.post<ResponseResult>(this.NOTICE_API_PREFIX, {...notice})
  }


  static delete(noticeIds: object) {
    return httpRequest.patch<ResponseResult>(`${this.NOTICE_API_PREFIX}/delete-notices`, {...noticeIds})
  }


  static update(noticeId: string, data: Notice) {
    return httpRequest.patch<ResponseResult>(`${this.NOTICE_API_PREFIX}/${noticeId}`, {
      ...data
    })
  }

  static updateAndPublishNotice(noticeId: string, data: Notice) {
    return httpRequest.put<ResponseResult>(`${this.NOTICE_API_PREFIX}/${noticeId}/update-publish-notice`, {
      ...data
    })
  }


  static createAndPublishNotice(notice: Notice) {
    return httpRequest.post<ResponseResult>(`${this.NOTICE_API_PREFIX}/create-publish-notice`, {...notice})
  }


  static noticesByUserId(userId: string) {
    return httpRequest.get<ResponseResult>(`${this.NOTICE_API_PREFIX}/${userId}/notice-me`)
  }

  static processedNoticeById(pendingId: string,userId: string){
    return httpRequest.patch<ResponseResult>(`${this.NOTICE_API_PREFIX}/${pendingId}/processed-notice/${userId}`)
  }



}
