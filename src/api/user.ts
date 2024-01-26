import type { BasePageModel } from '@/constants'
import type {
  BaseResponse,
  ChangePasswordModel,
  CreateUserModel,
  PageResponse,
ResponseResult,  User
} from '@/types'

export class UserAPI {
  private static USER_API_PREFIX = `${GlobalEnvConfig.BASE_API_PREFIX}/users`

  /**
   * 用户列表
   */
  static list(params: BasePageModel) {
    return httpRequest.get<PageResponse<User[]>>(this.USER_API_PREFIX, {
      ...params
    })
  }

  /**
   * 用户信息
   */
  static detail(userId: number) {
    return httpRequest.get<BaseResponse<User>>(`${this.USER_API_PREFIX}/${userId}`)
  }

  /**
   * 当前用户
   * @description 通过当前登录用户的 token 获取用户信息
   */
  static me() {
    return httpRequest.get<BaseResponse<User>>(`${this.USER_API_PREFIX}/me`)
  }

  /**
   * 创建用户
   */
  static create(data: CreateUserModel) {
    return httpRequest.post<BaseResponse<User>>(this.USER_API_PREFIX, {
      ...data
    })
  }

  /**
   * 更新用户
   */
  static update(userId: number, data: User) {
    return httpRequest.patch<BaseResponse<User>>(`${this.USER_API_PREFIX}/${userId}`, {
      ...data
    })
  }

  /**
   * 启用用户
   */
  static enable(userId: number) {
    return httpRequest.post<ResponseResult>(`${this.USER_API_PREFIX}/${userId}/enable`)
  }

  /**
   * 禁用用户
   */
  static disable(userId: number) {
    return httpRequest.post<ResponseResult>(`${this.USER_API_PREFIX}/${userId}/disable`)
  }

  /**
   * 重置密码
   */
  static resetPassword(userId: number, passWord: string) {
    return httpRequest.post<BaseResponse<User>>(`${this.USER_API_PREFIX}/${userId}/reset-password`, {
      passWord
    })
  }

  /**
   * 修改密码
   */
  static changePassword(userId: number, data: ChangePasswordModel) {
    return httpRequest.post<ResponseResult>(`${this.USER_API_PREFIX}/${userId}/change-password`, {
      ...data
    })
  }
}
