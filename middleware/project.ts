import { Middleware } from '@nuxt/types'
import { validate } from 'uuid'

const redirectAuthPage: Middleware = function ({ route, $user, error }) {
  if (!$user.onboarded) {
    return
  }
  //   if client is on /project/:id check that :id is a valid uuid

  const paths = route.path.split('/').filter(Boolean)

  if (paths[0] === 'dashboard' && paths[1] === 'project') {
    if (!validate(route.params.id)) {
      error({
        message: 'Invalid route!',
        statusCode: 403,
      })
    }
  }
}

export default redirectAuthPage
