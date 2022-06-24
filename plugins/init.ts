import Vue from 'vue'
import { Plugin } from '@nuxt/types'
import { CreateTestState } from '~/store/create-test'
import { CreateTestForm } from '~/types/shim'
import { oneFrame, sleep } from '~/utils'

const init: Plugin = function ({ app, store, $axios, $user }, inject) {
  if (process.client) {
    window.history.scrollRestoration = 'auto'

    // add html id
    document.documentElement.id = 'unbug-qa'

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

    const createTestFormProxy = new Proxy(
      {},
      {
        get(_, path: keyof CreateTestForm) {
          if (path === 'questionsLength') {
            return store.getters['create-test/questionsLength']
          }

          if (path === 'questions') {
            return store.getters['create-test/questions']
          }

          return (store.state['create-test'] as CreateTestState).form[path]
        },
      }
    )

    inject('createTestForm', createTestFormProxy)
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
