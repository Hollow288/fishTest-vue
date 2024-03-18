import NProgress from 'nprogress'
import {createRouter, createWebHistory, RouteRecordRaw} from 'vue-router'

import { processRouteTag } from './processor'
import {Router} from "@/types/api/router";
import { routes } from './routes'

NProgress.configure({ showSpinner: false })

// const { t } = i18n.global


// 创建路由实例
// const router = createRouter({
//   history: createWebHistory(),
//   routes: routes,
//   scrollBehavior: () => ({ left: 0, top: 0 })
// })


// function convertMenuToRoute(menu: Router): RouteRecordRaw {
//   const route: RouteRecordRaw = {
//     path: menu.path,
//     name: menu.name,
//     // component: menu.component ? () => import(`@/${menu.component}`) : undefined,
//     // component: menu.component ? () => import(menu.component) : undefined,
//     // component: resolve=>([menu.component]),
//     component: import(`${menu.component}`),
//     meta: {
//       title: () => t(menu.title),
//       icon: menu.icon ? () => import(`~icons/${menu.icon}`) : undefined,
//       disableAuth: menu.disableAuth === '1',
//       dismissTab: menu.dismissTab === '1'
//     }
//   }
//
//   if (menu.children) {
//     route.children = menu.children.map(convertMenuToRoute)
//   }
//
//   return route
// }
//
// function convertMenusToRoutes(menus: Router[]): RouteRecordRaw[] {
//   return menus.map(convertMenuToRoute)
// }


// // 动态添加路由的函数
// export async function addDynamicRoutes() {
//   const userStore = useUserStore()
//   const routeCount = router.options.routes.length
//   debugger
//   if (routeCount< 5 && typeof userStore.user.userId !== 'undefined' && userStore.user.userId !== null ) {
//     const { data } = await CommonAPI.allRouterAndChildren()
//     const dynamicRoutes = convertMenusToRoutes(data)
//     dynamicRoutes.forEach(route => {
//       router.addRoute(route)
//     })
//   }
// }
//
//
//
//
// // 导航守卫，用于启动进度条
// router.beforeEach((to, from, next) => {
//   if (to.path !== from.path) {
//     NProgress.start()
//   }
//   next()
// })
//
// // 导航守卫，用于结束进度条和动态添加路由
// router.afterEach(async (to) => {
//   SiteUtils.setDocumentTitle(to.meta.title)
//   processRouteTag(to)
//   NProgress.done()
//
//   // 在路由完成后检查用户信息，添加动态路由
//   await addDynamicRoutes()
// })



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
    next()
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
