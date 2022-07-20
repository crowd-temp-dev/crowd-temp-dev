import { Middleware } from '@nuxt/types'
import { RouteDialog } from '~/types'
import { validRouteDialog } from '~/utils'

const redirectAuthPage: Middleware = function ({ redirect, route, store }) {
  // check the $route.query.dialog value
  const dialogRoute = route.query.dialog as RouteDialog

  if (dialogRoute) {
    const removeDialogRoute = () =>
      redirect({
        query: {
          ...route.query,
          dialog: undefined,
        },
      })

    if (!validRouteDialog.includes(dialogRoute)) {
      removeDialogRoute()
    } else if (
      dialogRoute !== 'contact-us' &&
      !route.path.startsWith('/dashboard')
    ) {
      removeDialogRoute()
    } else {
      store.commit('app/setRouteDialog', dialogRoute)
    }
  }
}

export default redirectAuthPage
