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
  RemoveAvatar,
  SetupAccount,
  UpdateAvatar,
  UpdateUser,
} from '~/services/user'
import { showToasts } from '~/utils/showToast'
import { LoginForm } from '~/server-middleware/routes/user/login'
import { formBody, nextFrame, oneMinute, sleep, uid } from '~/utils'
import { UserData } from '~/server-middleware/types'
import { User } from '~/database/models/User/User'
import { DeleteAccountForm } from '~/server-middleware/routes/user/delete-account'
import { ChangePasswordForm } from '~/server-middleware/routes/user/change-password'
import { OnboardForm } from '~/server-middleware/routes/user/onboard'

export interface UserInfo {
  id: string | null
  firstName: string | null
  lastName: string | null
  name?: string
  email: string | null
  provider: User['provider'] | null
  showDashboardGuide?: boolean
  loginCount: number
  onboarded: boolean
  deleteTestWarn: boolean
}

export interface UserState {
  id: string
  name: string
  email: string
  info: UserInfo | null
  loading: boolean
  loggingOut: boolean
  avatarLoading: boolean
}

export interface LoginPayload extends LoginForm {
  remember: boolean
}

const state = (): UserState => ({
  id: null,
  name: null,
  email: null,
  info: null,
  loading: false,
  loggingOut: false,
  avatarLoading: false,
})

const mutations: MutationTree<UserState> = {
  setPublic(state, payload: UserState) {
    state.id = payload.id || null
    state.name = payload.name || null
    state.email = payload.email || null
  },

  update(state, payload: User) {
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

    state.avatarLoading = false

    state.loggingOut = false
  },

  setLoading(state, val?: boolean) {
    state.loading = typeof val === 'boolean' ? val : true
  },

  setLoggingOut(state, val?: boolean) {
    state.loggingOut = typeof val === 'boolean' ? val : true
  },

  setAvatarLoading(state, val?: boolean) {
    state.avatarLoading = typeof val === 'boolean' ? val : true
  },
}

// debounce reload
let lastReload = 0

const onboardingLoadingId = uid()

const actions: ActionTree<UserState, RootState> = {
  async login({ commit, state }, payload: LoginPayload) {
    if (state.info) {
      return {}
    }

    commit('setLoading')

    const { $axios, $pToast, $store, $router } = this.$router.app

    const { data, message, error } = await Login($axios, {
      password: payload.password,
      email: payload.email,
    })

    if (data) {
      commit('update', data)

      // set cookies
      this.$cookies.set('remember', Number(!!payload.remember))

      nextTick(() => {
        // send to home page
        this.$router.replace(data.onboarded ? '/dashboard' : '/onboard')

        nextTick(() => {
          requestAnimationFrame(() => {
            showToasts($pToast, message)
          })
        })
      })

      // clear project form
      !($store.state as RootState).projectSuite.create.empty &&
        $store.commit('projectSuite/create/reset', false)
    } else {
      if (error?.data) {
        if (error.title === 'confirm') {
          commit('setPublic', error.data)

          await sleep()

          $router.push('/auth/confirm-email')
        }
      }

      commit('setLoading', false)
    }

    return { data, error }
  },

  async logout({ commit, state }, alert: boolean = true) {
    if (!state.info || state.loading || state.loggingOut) {
      return {}
    }

    const { app } = this.$router

    const { $axios, $pToast, $nuxt, $fullscreenLoading } = app

    const alertId = 'loggingout'

    $fullscreenLoading.show({
      message: 'Logging out...',
      id: alertId,
    })

    await nextFrame()

    commit('setLoggingOut')

    commit('setLoading')

    const { message, error, status } = await Logout($axios, null)

    if (!error || status === 404) {
      commit('update', null)

      this.$cookies.set('remember', 0)

      nextTick(async () => {
        $nuxt.setLayout('landing-page')

        this.$router.replace('/auth/login')

        await sleep()

        $fullscreenLoading.hide({
          id: alertId,
        })

        alert && showToasts($pToast, message)
      })
    } else {
      commit('setLoading', false)
    }

    return { message, error }
  },

  // only reload after 30 seconds has elapsed
  async reload({ commit, dispatch, state }, progress: boolean) {
    if (
      (performance.now() - lastReload > oneMinute / 2 || !lastReload) &&
      !state.loggingOut
    ) {
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
            message: message[0].content,
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
    } else {
      commit('setLoading', false)
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

    commit('setLoading', false)

    return { message, error, data }
  },

  async delete({ commit }, payload: DeleteAccountForm) {
    commit('setLoading')

    const app = this.$router.app

    const { message, error, data } = await DeleteAccount(app.$axios, payload)

    if (!error) {
      app.$cookies.set('remember', '0')

      showToasts(app.$pToast, message)

      await sleep(200)

      location.reload()
    } else {
      showToasts(app.$pToast, message)

      commit('setLoading', false)
    }

    return { message, error, data }
  },

  async removeAvatar({ commit }) {
    commit('setAvatarLoading')

    const { app } = this.$router

    const { data, error, message } = await RemoveAvatar(app.$axios, null)

    if (data) {
      commit('update', data)
    }

    showToasts(app.$pToast, message)

    return { data, error, message }
  },

  async updateAvatar({ commit }, payload: File[]) {
    commit('setAvatarLoading')

    const { app } = this.$router

    const form = formBody()

    form.append('avatar', payload[0])

    const { data, error, message } = await UpdateAvatar(app.$axios, form)

    if (data) {
      commit('update', data)
    }

    showToasts(app.$pToast, message)

    return { data, error, message }
  },

  async onboard({ commit, state }, payload: OnboardForm) {
    if (state.info?.onboarded) {
      return
    }

    const { app } = this.$router

    app.$fullscreenLoading.show({
      id: onboardingLoadingId,
      message: 'Onboarding...',
    })

    const { data, error, message, status } = await SetupAccount(
      app.$axios,
      payload
    )

    if (error) {
      showToasts(app.$pToast, message)
    } else if (data) {
      commit('update', data)

      await app.$nextTick()

      await sleep()
    }

    if (data || status === 405) {
      if (!data) {
        commit('update', {
          ...state.info,
          onboarded: true,
        } as User)

        await nextTick()
      }

      await app.$router.replace('/dashboard')
    }

    app.$fullscreenLoading.hide({
      id: onboardingLoadingId,
    })
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

    const { firstName, lastName } = state.info

    return `${firstName[0] || ''}${lastName[0] || ''}` || '--'
  },
}

export default {
  state,
  mutations,
  actions,
  getters,
}
