import {BaseResponse} from "@/types";

export class CommonAPI {
  private static COMMON_API_PREFIX = `${GlobalEnvConfig.BASE_API_PREFIX}/common`


  static allRouterAndChildren() {
    return httpRequest.get<BaseResponse>(`${this.COMMON_API_PREFIX}/router-children`)
  }


  static allMenuAndChildren() {
    return httpRequest.get<BaseResponse>(`${this.COMMON_API_PREFIX}/menu-children`)
  }


}
