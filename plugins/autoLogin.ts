import { Plugin } from '@nuxt/types'

const autoLogin: Plugin = async function ({ store, $cookies, route }) {
  // don't try auto login for clients answering tests
  if (route.name?.startsWith('answer-test')) {
    return
  }

  // logout users that didnt choose to be remembered
  const remember = $cookies.get('remember')

  const clearUserStore = () => {
    store.commit('user/update', null)

    $cookies.set('remember', 0)
  }

  if (String(remember) === '1') {
    const { data } = await store.dispatch('user/reload')

    const loginProviderAlert = $cookies.get('login_provider_alert')

    if (loginProviderAlert) {
      document.addEventListener(
        'app-mounted',
        () => {
          window.$nuxt.$pToast.open({
            message: loginProviderAlert,
          })
        },
        { once: true }
      )

      $cookies.remove('login_provider_alert')
    }

    if (data) {
      store.commit('user/update', data)
    } else {
      clearUserStore()
    }
  } else clearUserStore()
}

export default autoLogin
