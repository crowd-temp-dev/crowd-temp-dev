import { Middleware } from '@nuxt/types'
import { validate } from 'uuid'

const redirectAuthPage: Middleware = function ({ route, error }) {
  //   if client is on /create-test/:id check that :id is a valid uuid

  const paths = route.path.split('/').filter(Boolean)
  
  if (paths[0] === 'create-test') {
    if (!validate(route.params.id)) {
      error({
        message: "Invalid route!",
        statusCode: 403
      })
    }
  }
}

export default redirectAuthPage
