import { Middleware } from '@nuxt/types'

// for app layout, if client is not logged in on pages that uses the app layout will be sent back to login
export const isLoggedInMiddleware: Middleware = async function ({
  redirect,
  $user,
  route,
}) {
  if (!$user.loggedIn && route.path !== '/auth/login') {
    redirect('/auth/login')
  } else {
    await $user.reload()

    if (!$user.onboarded && route.path !== '/onboard') {
      redirect('/onboard')
    }

    if ($user.onboarded && route.path === '/onboard') {
      redirect('/dashboard')
    }
  }
}

// for landing page layout, if client is logged in on pages that uses the landing-page layout will be sent back to home
export const notLoggedInMiddleware: Middleware = async function ({
  redirect,
  $user,
  route,
}) {
  // free passage for people answering test
  if (route.name?.startsWith('answer-test')) {
    return
  }

  if ($user.loggedIn && !/^\/$|^\/auth\/account-confirmed$/.test(route.path)) {
    redirect('/dashboard')

    await $user.reload()
  }

  if (
    $user.loggedIn &&
    route.path === '/auth/account-confirmed' &&
    $user.onboarded
  ) {
    redirect('/dashboard')
  }
}

export const answerTestMiddleware: Middleware = function ({
  route,
  error,
  store,
}) {
  const { shareLink, doneLink } = route.params

  if (!/^cid-(?:[0-9a-zA-Z-]+)$/.test(shareLink || doneLink)) {
    error({
      message: 'Invalid route!',
      statusCode: 403,
    })
  } else {
    store.commit('answer-test/setShareLink', shareLink || doneLink)

    store.dispatch('answer-test/getUser')
  }
}
