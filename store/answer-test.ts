// eslint-disable-next-line import/named
import { MutationTree, ActionTree, GetterTree } from 'vuex'
import { RootState } from '.'
import { showToasts } from '~/utils/showToast'
import { CreateTestFormQuestion } from '~/types/form'
import {
  AnswerQuestion,
  BeginTest,
  ConfirmSection,
  GetAnsUser,
} from '~/services/answerTest'
import { answerTestLoadingId, oneFrame, sleep } from '~/utils'

export interface AnswerTestForm {
  testDetails?: {
    name: string
    description: string
    id: string
  }

  welcomeScreen?: {
    title: string
    message: string
    buttonText: string
  }

  thankYouScreen?: {
    title: string
    message: string
  }

  [key: `question-${number}`]: CreateTestFormQuestion

  empty?: boolean
  error?: boolean
}

export interface AnswerTestState {
  form: AnswerTestForm
  loading: boolean
  submitting: boolean
  username: string
  shareLink: string
}

const state = (): AnswerTestState => ({
  loading: false,
  form: {
    empty: true,
    error: false,
  },
  submitting: false,
  username: '',
  shareLink: 'loading',
})

const mutations: MutationTree<AnswerTestState> = {
  setLoading(state: AnswerTestState, val?: boolean) {
    state.loading = typeof val === 'boolean' ? val : true
  },
  setForm(state, val: AnswerTestForm) {
    state.form = val
  },
  setSubmitting(state, val?: boolean) {
    state.submitting = typeof val === 'boolean' ? val : true
  },
  setUsername(state, val: string) {
    state.username = val
  },
  setShareLink(state, val: string) {
    state.shareLink = val
  },
}

const actions: ActionTree<AnswerTestState, RootState> = {
  async getUser({ commit, state }) {
    commit('setLoading', true)

    const { app } = this.$router

    const { data, error, message, status } = await GetAnsUser(
      app.$axios,
      state.shareLink
    )

    const changeRoute = (sendTo: string) => {
      const fullPath = `${location.origin}${app.$route.fullPath}`.replace(
        /\/$/,
        ''
      )
      const sendToRoute = `${location.origin}/answer-test/${sendTo}`

      if (fullPath !== sendToRoute) {
        this.$router.replace(`/answer-test/${sendTo}/`.replace(/\/{2,}$/, '/'))
      }
    }

    if (message) {
      showToasts(app.$pToast, message)
    }

    // send to sendTo page from error
    if (error) {
      commit('setForm', {
        error: true,
        empty: false,
      })

      app.$nextTick(() => {
        app.$nuxt.error({
          message: message ? message[0].content : 'An error occured!',
          statusCode: status,
        })
      })
    } else if (data) {
      const { fullTest, sendTo, username } = data

      if (username) {
        commit('setUsername', username)
      }

      if (fullTest) {
        commit('setForm', fullTest)
      }

      if (sendTo) {
        changeRoute(sendTo)
      }
    }

    await sleep(oneFrame)

    app.$fullscreenLoading.hide({
      id: answerTestLoadingId,
    })

    commit('setLoading', false)
  },

  async beginTest({ commit, state }, name: string) {
    const { app } = this.$router

    const { error, message, data, status } = await BeginTest(app.$axios, {
      shareLink: state.shareLink || '',
      name: name || state.username,
    })

    if (error) {
      showToasts(app.$pToast, message)
    } else {
      data?.username && commit('setUsername', data.username)

      sleep(250).then(() => {
        if (app.$route.params.question !== '1a' && data?.nextIndex) {
          const nextRoute = `/answer-test/${state.shareLink}/${data.nextIndex}`

          if (app.$route.fullPath.replace(/\/$/, '') !== nextRoute) {
            app.$router.replace(`${nextRoute}/`)
          }
        }
      })

      return { data, error, message, status }
    }
  },

  async confirmSection({ commit, state }, payload: any[]) {
    commit('setLoading', true)

    const { app } = this.$router

    const shareLink = state.shareLink

    const { data, error, message, status } = await ConfirmSection(app.$axios, {
      value: payload,
    })

    if (error) {
      app.$nuxt.error({
        message: message[0].content,
        statusCode: status,
      })
    } else if (data?.nextIndex) {
      const nextRoute = `/answer-test/${shareLink}/${data.nextIndex}`

      if (app.$route.fullPath.replace(/\/$/, '') !== nextRoute) {
        app.$router.replace(`${nextRoute}/`)
      }
    }

    commit('setLoading', false)
  },

  async answerQuestion({ state }, values: string[]) {
    const { app } = this.$router

    const shareLink = state.shareLink

    const { data, error, message, status } = await AnswerQuestion(app.$axios, {
      shareLink,
      values,
    })

    if (error) {
      showToasts(app.$pToast, message)

      app.$nuxt.error({
        message: message[0].content,
        statusCode: status,
      })
    } else if (data) {
      const nextRoute = `/answer-test/${shareLink}/${data.sendTo}`

      if (app.$route.fullPath.replace(/\/$/, '') !== nextRoute) {
        app.$router.replace(`${nextRoute}/`)
      }
    }
  },
}

const getters: GetterTree<AnswerTestState, RootState> = {}

export default {
  state,
  mutations,
  actions,
  getters,
}
