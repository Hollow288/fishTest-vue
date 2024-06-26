export interface CreateUserModel {
  userName: string
  passWord: string
}

export interface User {
  userId?: string
  userName?: string
  email?: string
  phoneNumber?: string
  name?: string
  firstName?: string
  lastName?: string
  nickName?: string
  avatarUrl?: string
  gender?: string
  genderLabel?: string
  country?: string
  province?: string
  city?: string
  status?: string
  createTime?: string
  address?: string
  biography?: string
  birthDate?: string
  verified?: boolean
  enabled?: boolean
  createdAt?: string
  githubId?:string
  githubUrl?:string
  roles?: string[]
  authTypes?: string[]
}


export interface UserRole {
  value?: string
  label?: string
  avatarUrl?: string
}

/**
 * 性别
 */
// export type Gender = 0 | 1

/**
 * 认证类型
 */
export enum AuthType {
  GitHub = 0,
  Google = 1
}
