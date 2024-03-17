export interface Router {
  menuId: string
  routerParentId: string
  path: string | null
  name: string
  component: string | null
  title: string | null
  icon: string | null
  disableAuth: string
  dismissTab: string
  children: Router[] | null
}
