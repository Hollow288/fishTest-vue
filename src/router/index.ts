import NProgress from 'nprogress'
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import type {Router} from '@/types/api/router'

import { processRouteTag } from './processor'
import { routes } from './routes'

NProgress.configure({ showSpinner: false })

const { t } = i18n.global

function convertMenuToRoute(menu: Router): RouteRecordRaw {
  const route: RouteRecordRaw = {
    path: menu.path,
    name: menu.name,
    // component: menu.component ? () => import(`@/${menu.component}`) : undefined,
    component: menu.component ? () => import(menu.component) : undefined,
    meta: {
      title: () => t(menu.title),
      // icon: menu.icon ? () => import(`~icons/${menu.icon}`) : undefined,
      disableAuth: menu.disableAuth === '1',
      dismissTab: menu.dismissTab === '1'
    }
  }

  debugger

  if (menu.children) {
    route.children = menu.children.map(convertMenuToRoute)
  }

  return route
}

function convertMenusToRoutes(menus: Router[]): RouteRecordRaw[] {
  return menus.map(convertMenuToRoute)
}


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ left: 0, top: 0 })
})

router.beforeEach ((to, from, next) => {
  if (to.path !== from.path) {
    NProgress.start()
  }
  // CommonAPI.allRouterAndChildren().then(result=>{
  //   // console.log(result.data)
  //   const routes: RouteRecordRaw[] = convertMenusToRoutes(result.data)
  //   debugger
  //   router.addRoute(routes) // 动态添加路由
  //   // next({ ...to, replace: true }) // 重新导航到目标路由
  //   next()
  // })
  next()
})

router.afterEach((to) => {
  // 拼接站点标题
  SiteUtils.setDocumentTitle(to.meta.title)
  processRouteTag(to)
  NProgress.done()
})

export default router

export * from './prefix'
