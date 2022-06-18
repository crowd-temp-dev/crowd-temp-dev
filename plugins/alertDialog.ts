import { Plugin } from '@nuxt/types'
import { AppState } from '~/store/app/state'
import { OpenAlertArgs } from '~/types/shim'
import { sleep, uid } from '~/utils'

const alertDialog: Plugin = function ({ store }, inject) {
  const proxy = new Proxy(
    {},
    {
      get(_, path: keyof Vue['$alert']) {
        if (path === 'open') {
          return async (payload: OpenAlertArgs) => {
            if (payload) {
              // if open, close and wait
              if ((store.state.app as AppState).alertDialog.active) {
                store.commit('app/updateAlertDialog', {
                  active: false,
                } as AppState['alertDialog'])

                await sleep(250)
              }

              store.commit('app/updateAlertDialog', {
                active: true,
                key: uid(),
                ...payload,
              } as AppState['alertDialog'])
            }
          }
        }

        if (path === 'close') {
          return () => {
            store.commit('app/updateAlertDialog', {
              active: false,
            } as AppState['alertDialog'])
          }
        }

        return (store.state.app as AppState).alertDialog[path]
      },
      set(_, path: keyof Vue['$alert'], val: boolean) {
        if (path === 'active') {
          store.commit('app/updateAlertDialog', {
            active: val,
          } as AppState['alertDialog'])

          return true
        }

        return false
      },
    }
  )

  inject('alert', proxy)
}

export default alertDialog
