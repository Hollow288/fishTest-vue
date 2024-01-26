import type { User } from '@/types'

export interface LoginModel {
  userName: string
  passWord: string
}

export interface SignupModel extends LoginModel {
  confirmPassword: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
}

export interface UserTokenResponse extends TokenResponse {
  user: User
}

export interface ChangePasswordModel {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}
