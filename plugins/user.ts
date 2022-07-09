import { Plugin } from '@nuxt/types'
import { User } from '~/types'
import { LoginPayload } from '~/store/user'
import { DeleteAccountForm } from '~/server-middleware/routes/user/delete-account'
import { ChangePasswordForm } from '~/server-middleware/routes/user/change-password'

const userPlugin: Plugin = function ({ store }, inject) {
  const userProxy = new Proxy({} as User, {
    get(_, path: keyof User) {
      const userState = store.state.user.info as User

      // methods go first
      if (path === 'login') {
        return async (payload: LoginPayload) =>
          await store.dispatch('user/login', payload)
      }

      if (path === 'reload') {
        return async (progress: boolean) =>
          await store.dispatch('user/reload', progress)
      }

      if (path === 'update') {
        return async (payload?: {}) =>
          await store.dispatch('user/update', payload)
      }

      if (path === 'logout') {
        return async (alert: boolean = true) =>
          await store.dispatch('user/logout', alert)
      }

      if (path === 'delete') {
        return async (arg: DeleteAccountForm) =>
          await store.dispatch('user/delete', arg)
      }

      if (path === 'changePassword') {
        return async (arg: ChangePasswordForm) =>
          await store.dispatch('user/changePassword', arg)
      }

      if (!userState) {
        return null
      }

      // at this point user must be logged in
      if (path === 'loggedIn') {
        return true
      }

      if (path === 'initials') {
        return store.getters['user/initials']
      }

      if (path) return userState[path]
    },
  })

  inject('user', userProxy)

  window.$user = userProxy
}

export default userPlugin
