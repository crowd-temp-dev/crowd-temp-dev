import Vue from 'vue'
import { Plugin } from '@nuxt/types'
import { oneFrame, setClientOs, sleep } from '~/utils'

const init: Plugin = function ({ app, store, $axios, $user }) {
  if (process.client) {
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
