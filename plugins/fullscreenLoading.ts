import { Plugin } from '@nuxt/types'

const pageLoading: Plugin = function ({ store }, inject) {
  const api: Vue['$fullscreenLoading'] = {
    async show({ message, delay, duration, id }) {
      if (process.client) {
        await store.dispatch('app/showFullscreenLoading', {
          message,
          delay,
          duration,
          id,
        })
      }

      return Promise.resolve(true)
    },
    async hide(arg = {}) {
      if (process.client) {
        const { id } = arg

        await store.dispatch('app/hideFullscreenLoading', {
          id,
        })
      }

      return Promise.resolve(true)
    },
  }

  const proxy = new Proxy(api, {
    get(_, path: keyof Vue['$fullscreenLoading']) {
      return api[path]
    },
  })

  inject('fullscreenLoading', proxy)
}

export default pageLoading
