// eslint-disable-next-line import/named
import { MutationTree, ActionTree, GetterTree } from 'vuex'
import { nextTick } from '@vue/composition-api'
import { RootState } from '.'
import {
  ChangePassword,
  DeleteAccount,
  Login,
  Logout,
  ReloadUser,
  UpdateUser,
} from '~/services/auth'
import { showToasts } from '~/utils/showToast'
import { LoginForm } from '~/server-middleware/routes/user/login'
import { ApiResponse } from '~/types'
import { sleep } from '~/utils'
import { UserData } from '~/server-middleware/types'
import { User } from '~/database/models/User/User'
import { DeleteAccountForm } from '~/server-middleware/routes/user/delete-account'
import { ChangePasswordForm } from '~/server-middleware/routes/user/change-password'

export interface UserInfo {
  id: string | null
  name: string | null
  email: string | null
}

export interface UserState {
  info: UserInfo | null
  loading: boolean
}

export interface LoginPayload extends LoginForm {
  remember: boolean
}

const state = (): UserState => ({
  info: null,
  loading: false,
})

const mutations: MutationTree<UserState> = {
  update(state: UserState, payload: User) {
    if (payload) {
      const userData = {
        ...(payload || {}),
      } as UserInfo

      state.info = {
        ...state.info,
        ...userData,
      }
    } else {
      state.info = null
    }

    state.loading = false
  },

  setLoading(state: UserState, val?: boolean) {
    state.loading = typeof val === 'boolean' ? val : true
  },
}

// debounce reload
let lastReload = 0

const actions: ActionTree<UserState, RootState> = {
  async login({ commit, state }, payload: LoginPayload) {
    if (state.info) {
      return {}
    }

    commit('setLoading')

    const { $axios, $pToast, $store } = this.$router.app

    const { data, message, error } = (await Login($axios, {
      password: payload.password,
      email: payload.email,
    } as LoginForm)) as ApiResponse<User>

    if (data) {
      commit('update', data)

      // set cookies
      this.$cookies.set('remember', Number(!!payload.remember))

      nextTick(() => {
        // send to home page
        this.$router.replace('/')
      })

      // clear createTest form
      $store.commit('create-test/resetForm')
    }

    nextTick(() => {
      requestAnimationFrame(() => {
        showToasts($pToast, message)
      })
    })

    return { data, error }
  },

  async logout({ commit, state }, alert: boolean = true) {
    if (!state.info || state.loading) {
      return {}
    }

    commit('setLoading')

    const { $axios, $pToast, $nuxt } = this.$router.app

    const { message, error, status } = await Logout($axios, null)

    if (!error || status === 404) {
      commit('update', null)

      this.$cookies.set('remember', 0)

      nextTick(async () => {
        $nuxt.setLayout('landing-page')

        this.$router.replace('/auth/login')

        await sleep()

        alert && showToasts($pToast, message)
      })
    }

    return { message, error }
  },

  // only reload after 5 seconds has elapsed
  async reload({ commit, dispatch }, progress: boolean) {
    if (performance.now() - lastReload > 5000 || !lastReload) {
      lastReload = performance.now()

      const { data, error, message, status } = await ReloadUser(
        this.$axios,
        progress
      )

      if (data) {
        commit('update', data)
      }

      if (/^(?:404|401)$/.test(String(status))) {
        this.$router.app &&
          this.$router.app.$pToast.open({
            error: true,
            message: 'Session expired!',
            duration: 5000,
          })

        await dispatch('logout')
      }

      return { data, error, message, status }
    }

    return { data: {}, message: [], status: 304 }
  },

  async update({ commit }, payload: UserData) {
    commit('setLoading')

    const { data, error, message } = await UpdateUser(this.$axios, payload)

    if (data) {
      commit('update', data)
    }

    return { message, error, data }
  },

  async changePassword({ commit }, payload: ChangePasswordForm) {
    commit('setLoading')

    const app = this.$router.app

    const { data, error, message } = await ChangePassword(app.$axios, payload)

    if (data) {
      commit('update', data)
    }

    showToasts(app.$pToast, message)

    return { message, error, data }
  },

  async delete({ commit }, payload: DeleteAccountForm) {
    commit('setLoading')

    const app = this.$router.app

    const { message, error } = await DeleteAccount(app.$axios, payload)

    if (!error) {
      app.$cookies.set('remember', '0')

      showToasts(app.$pToast, message)

      await sleep(200)

      location.reload()
    } else showToasts(app.$pToast, message)
  },
}

const getters: GetterTree<UserState, RootState> = {
  loggedIn(state) {
    return !!state.info
  },
  initials(state) {
    if (!state.info) {
      return ''
    }

    const splitName = state.info.name?.split(' ') || []

    return `${splitName[0][0]}${(splitName[1] || [])[0] || ''}`
  },
}

export default {
  state,
  mutations,
  actions,
  getters,
}
