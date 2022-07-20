import Vue from 'vue'
import { Plugin } from '@nuxt/types'
import { getOS, oneFrame, setClientOs, sleep } from '~/utils'
import { AppState } from '~/store/app/state'
import { RootState } from '~/store'

const init: Plugin = function ({ app, store, $axios, $user }, inject) {
  if (process.client) {
    const appStateProxy = new Proxy(
      {},
      {
        get(_, path: keyof AppState | 'os') {
          if (path === 'os') {
            return getOS()
          }

          return (store.state as RootState).app[path]
        },
      }
    )

    inject('appState', appStateProxy)

    window.history.scrollRestoration = 'auto'

    // add html id
    document.documentElement.id = 'unbug-qa'

    setClientOs()

    sleep(oneFrame).then(() => {
      // add overlay element

      const overlay = document.createElement('div')

      const id = 'app-overlay'

      overlay.id = id

      document.body.append(overlay)

      const OverlayComponent = Vue.extend({
        name: 'OverlayTargetComponent',
        extends: app,
        render(h) {
          return h('TeleportTarget', {
            key: store.state.app.globalKey,
            props: {
              name: 'overlay',
              multiple: true,
            },
          })
        },
      })

      const overlayEl = new OverlayComponent()

      overlayEl.$mount(`#${id}`)
    })
  }

  $axios.onResponseError(({ response }) => {
    if (response?.status === 401 && $user.loggedIn) {
      $user.logout(false)
    }
  })

  Vue.directive('autofocus', {
    inserted(el, binding) {
      const { value } = binding

      if (value === false) {
        return
      }

      const getDelay = () => {
        const frame = (1 / 60) * 1000

        if (typeof value === 'boolean') {
          return 0
        }

        if (typeof value === 'object' && value?.delay) {
          return value.delay
        }

        return Math.max(Number(value || 0) || frame, frame)
      }

      sleep(Number(getDelay())).then(() => {
        el.focus()
      })
    },
  })
}

export default init
