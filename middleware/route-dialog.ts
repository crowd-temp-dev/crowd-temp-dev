import { Middleware } from '@nuxt/types'
import { RouteDialog } from '~/types'
import { validRouteDialog } from '~/utils'

const redirectAuthPage: Middleware = function ({ redirect, route }) {
  // check the $route.query.dialog value
  if (route.query.dialog) {
    if (!validRouteDialog.includes(route.query.dialog as RouteDialog)) {
      redirect({
        query: {
          ...route.query,
          dialog: undefined,
        },
      })
    }
  }
}

export default redirectAuthPage
