import { Middleware } from '@nuxt/types'
import { validate } from 'uuid'

const redirectAuthPage: Middleware = function ({
  redirect,
  error,
  route,
  $user,
}) {
  //   if client is on /auth/?, and trying to access /auth/[sign-in|sign-up|forgot-password|reset-password], allow, else redirect to sign-up

  const paths = route.path.split('/').filter(Boolean)

  if (paths[0] === 'auth') {
    // check if more than 1 extra path is attached. Eg /auth/foo/bar
    if (paths.length > 2) {
      return redirect(200, '/auth/sign-up')
    }

    // check if the second path is valid
    const validAuthPages = [
      'login',
      'sign-up',
      'forgot-password',
      'reset-password',
      'confirm-email',
      'account-confirmed',
    ]

    if (!validAuthPages.includes(paths[1])) {
      redirect(200, '/auth/sign-up')
    }

    // if it's reset-password path, check that a token query exist.
    if (paths[1] === 'reset-password') {
      if (!route.query.token) {
        error({
          message: 'Unauthorized route!',
          statusCode: 401,
        })
      } else if (!validate(route.query.token as string)) {
        error({
          message: 'Invalid token!',
          statusCode: 401,
        })
      }
    }

    // check confirm-email page. Make sure $user has id
    if (paths[1] === 'confirm-email') {
      if (!$user.id) {
        redirect('/auth/sign-up')
      }
    }

    if (paths[1] === 'account-confirmed' && !$user.id) {
      if (!route.query.token) {
        redirect('/auth/signup')
      } else if (!route.query.token || !validate(route.query.token as string)) {
        error({
          message: 'Invalid token!',
          statusCode: 400,
        })
      }
    }
  }
}

export default redirectAuthPage
