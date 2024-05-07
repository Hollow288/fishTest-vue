import NProgress from 'nprogress'
import {createRouter, createWebHistory} from 'vue-router'

import { useUserStore } from '@/store/user'

import { processRouteTag } from './processor'
import { routes } from './routes'
import {AuthAPI} from "@/api/auth";

NProgress.configure({ showSpinner: false })


const initializeRouter = async () => {
  const routesArray = await routes()

  const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: routesArray,
    scrollBehavior: () => ({ left: 0, top: 0 })
  })

  router.beforeEach((to, from, next) => {
    if (to.path !== from.path) {
      NProgress.start()
    }
    if(to.path !== '/'
      && to.path !== '/login'
      && to.path !== '/error-pages/403'
      && to.path !== '/error-pages/404'
      && to.path !== '/error-pages/418'
      && to.path !== '/error-pages/500'){
      const userStore = useUserStore()
      // debugger
      const {userId} = userStore.getUser()
      // Todo 为什么这里刷新界面就是undefined 而正常跳转就正常  :因为刷新界面后清空了store  https://prazdevs.github.io/pinia-plugin-persistedstate/zh/
      if(typeof userId !== 'undefined'){
        AuthAPI.hasRoleToInterface(userId, {toPath:to.path}).then(result=>{
          if(result.message === '认证成功'){
            next()
          }else{
            // eslint-disable-next-line no-param-reassign
            to.path = '/error-pages/403'
            next()
          }
        })
      }else{
        next()
      }
    }else{
      next()
    }
  })

  router.afterEach((to) => {
    // 拼接站点标题
    SiteUtils.setDocumentTitle(to.meta.title)
    processRouteTag(to)
    NProgress.done()
  })

  return router
}


const router = await initializeRouter()

export default router

export * from './prefix'
