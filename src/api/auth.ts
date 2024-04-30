import type { BaseResponse, LoginModel, SignupModel, UserTokenResponse } from '@/types'
import type {ResponseResult} from '@/types'

// 登录类型
enum LoginType {
  USERNAME = 1, // 用户名登录
  EMAIL = 2 // 邮箱登录
}

export class AuthAPI {
  private static AUTH_API_PREFIX = `${GlobalEnvConfig.BASE_API_PREFIX}/user`

  static REFRESH_API_URL = `${this.AUTH_API_PREFIX}/refresh`

  /**
   * 登录
   */
  static login(data: LoginModel) {
    // const salt = bcrypt.genSaltSync(10)
    // data.passWord = bcrypt.hashSync(data.passWord,salt)
    return httpRequest.post<BaseResponse<UserTokenResponse>>(
      `${this.AUTH_API_PREFIX}/login`,
      { ...data },
      { params: { type: LoginType.USERNAME } }
    )
  }

  /**
   * 注册
   */
  static signup(data: SignupModel) {
    return httpRequest.post<BaseResponse<UserTokenResponse>>(`${this.AUTH_API_PREFIX}/signup`, {
      ...data
    })
  }

  /**
   * 刷新令牌
   */
  static async refresh(token: string) {
    return httpRequest.post<BaseResponse<UserTokenResponse>>(
      this.REFRESH_API_URL,
      {},
      { params: { token } }
    )
  }

  /**
   * GitHub 登录
   */
  static loginWithGitHub(code: string) {
    return httpRequest.post<BaseResponse<UserTokenResponse>>(
      `${this.AUTH_API_PREFIX}/login/github`,
      { code }
    )
  }

  /**
   * Google 登录
   */
  static loginWithGoogle(code: string) {
    return httpRequest.post<BaseResponse<UserTokenResponse>>(
      `${this.AUTH_API_PREFIX}/login/google`,
      { code }
    )
  }


  /**
   * 登出
   */
  static  logout(){
    return  httpRequest.post<ResponseResult>('user/logout')
  }


  static hasRoleToInterface(userId:string,toPath:object){
    return  httpRequest.post<ResponseResult>(`user/${userId}/has-role-interface`,{
      ...toPath
    })
  }
}
