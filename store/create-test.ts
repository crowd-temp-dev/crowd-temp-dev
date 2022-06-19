import Vue from 'vue'
// eslint-disable-next-line import/named
import { MutationTree, ActionTree, GetterTree } from 'vuex'
import { nextTick } from '@vue/composition-api'
import { RootState } from '.'
import { getObjectPathValue, pingAddNewBlockBtn, sleep } from '~/utils'
import { CreateTest, GetCreateTest, GetRecruit, PublishTest, UpdateTestDetail } from '~/services/createTest'
import { showToasts } from '~/utils/showToast'
import { QuestionModelValue } from '~/components/App/CreateTest/Steps/FollowUpQuestion/Question/type'
import { CreateTestFormQuestion } from '~/types/form'
import { UpdateTestDetailForm } from '~/server-middleware/routes/create-test/updateTestDetail'

const createTestAlertTitle = 'You have a test in progress!'

export interface CreateTestForm {
  testDetails: {
    name: string
    description: string
  }

  welcomeScreen: {
    title: string
    message: string
    buttonText: string
  }

  thankYouScreen: {
    title: string
    message: string
  }

  [key: `question-${number}`]: CreateTestFormQuestion

  empty?: boolean
}

export interface CreateTestState {
  details: {
    id: string | null
    published?: boolean
    shareLink?: string
    unlimitedInvites?: boolean
    stopAcceptingResponse?: boolean
    responses?: number
    favourite?: boolean
  }
  form: CreateTestForm
  loading: boolean
  submitting: boolean
  publishing: boolean
}

const freshForm = () =>
  ({
    testDetails: {
      name: 'New test',
      description: '',
    },
    welcomeScreen: {
      buttonText: 'Get started',
      message:
        "You've been invited to take a short test. Your test contains more than one section, please pay attention to the instructions before each section. Also note that you can only answer each question once.",
      title: 'Hi there 👋,',
    },
    thankYouScreen: {
      message: '',
      title: '',
    },
    empty: true,
  } as CreateTestForm)

const questionKeysRegExp = /^question-\d$/

const state = (): CreateTestState => ({
  form: freshForm(),
  loading: false,
  submitting: false,
  details: {
    id: null,
    published: false
  },
  publishing: false
})

const mutations: MutationTree<CreateTestState> = {
  setId(state, id: string | null) {
    state.details.id = id
  },

  setPublishing(state, val: boolean) {
    state.publishing = val
  },

  updateDetails(state, payload: CreateTestState['details']) {
    const id = state.details.id

    const newValue = {
      ...state.details,
      ...payload,
    }

    state.details = {
      ...newValue,
      id,
    }

    state.publishing = false
  },

  updateForm(
    state: CreateTestState,
    payload: {
      path: string
      value: any
      override?: boolean
    }
  ) {
    if (payload) {
      const splitPath = payload.path.split('.')

      if (payload.path) {
        if (state.form.empty) {
          let oldValue = getObjectPathValue(payload.path, state.form)

          if (typeof oldValue === 'string') {
            oldValue = oldValue.trim()
          }

          const newValue =
            typeof payload.value === 'string'
              ? payload.value.trim()
              : payload.value

          state.form.empty = oldValue === newValue
        }

        const path = splitPath.splice(0, splitPath.length - 1).join('.')

        const newState = { ...state.form }

        Vue.set(
          getObjectPathValue(path, newState),
          splitPath.slice(-1)[0],
          payload.value
        )

        state.form = { ...newState }
      } else {
        let newFormValue = payload.override
          ? payload.value
          : {
              ...state.form,
              ...payload.value,
            }

        if (state.form.empty) {
          state.form.empty =
            JSON.stringify(state.form) === JSON.stringify(newFormValue)

          newFormValue = {
            ...newFormValue,
            empty: state.form.empty,
          }
        }

        state.form = newFormValue
      }
    }

    state.loading = false
  },

  resetForm(state: CreateTestState) {
    state.form = freshForm()
    state.details.published = false
  },

  setLoading(state: CreateTestState, val?: boolean) {
    state.loading = typeof val === 'boolean' ? val : true
  },

  setSubmitting(state: CreateTestState, val: boolean) {
    state.submitting = val
  },
}

const actions: ActionTree<CreateTestState, RootState> = {
  setId({ commit, state }, id: string | null) {
    const getValue = (): string | undefined | null => {
      if (typeof id === 'string') {
        const { app } = this.$router

        if (state.details.id && state.details.id !== id && !state.form.empty) {
          sleep(250).then(() => {
            app.$alert.open({
              title: createTestAlertTitle,
              subtitle:
                'Creating a new test will clear your previous progress.',
              actions: [
                {
                  label: 'Create new test',
                  attrs: {
                    plain: true,
                    destructive: true,
                  },
                  events: {
                    click: () => {
                      commit('setId', id)

                      commit('resetForm')

                      app.$alert.close()
                    },
                  },
                },
                {
                  label: 'Continue test',
                  attrs: {
                    primary: true,
                    autofocus: true,
                  },
                  events: {
                    click: () => {
                      if (app.$route.params.id !== state.details.id) {
                        app.$router.replace({
                          params: {
                            id: state.details.id as string,
                          },
                        })
                      }

                      app.$alert.close()
                    },
                  },
                },
              ],
            })
          })
        } else {
          return id
        }
      } else return null
    }

    const value = getValue()

    if (typeof value !== 'undefined') {
      commit('setId', value)
    }
  },

  updateForm({ commit, rootState }, payload: CreateTestForm) {
    if (
      rootState.app.alertDialog.active &&
      rootState.app.alertDialog.title === createTestAlertTitle
    ) {
      return
    }

    commit('updateForm', payload)
  },

  updateDetails({ commit, rootState }, payload: CreateTestState['details']) {
    if (
      rootState.app.alertDialog.active &&
      rootState.app.alertDialog.title === createTestAlertTitle
    ) {
      return
    }

    commit('updateDetails', payload)
  },

  async submit({ state, commit, getters }) {
    const questions = getters.questions as QuestionModelValue[]

    if (!questions.length) {
      await pingAddNewBlockBtn()

      return {}
    }

    const { app } = this.$router

    commit('setSubmitting', true)

    await nextTick()

    // format form to group questions by type
    const rawForm = { ...state.form }

    const formatForm = {
      id: state.details.id,
      TestDetails: rawForm.testDetails,
      WelcomeScreen: rawForm.welcomeScreen,
      ThankYouScreen: rawForm.thankYouScreen,
    } as Record<string, any>

    questions.forEach((question, index) => {
      if (!formatForm[question.type]) {
        formatForm[question.type] = {} as Record<`${number}`, any>
      }

      formatForm[question.type][`${index}`] = Object.fromEntries(
        Object.entries(question).filter((entry) => entry[0] !== 'type')
      )
    })

    if (Object.keys(formatForm).length < 4) {
      await pingAddNewBlockBtn()

      return {}
    }

    const { data, error, message } = await CreateTest(app.$axios, formatForm)

    if (!error) {
      this.$router.push(`/create-test/recruit/${state.details.id}`)
    }

    showToasts(app.$pToast, message)

    commit('setSubmitting', false)

    return { data, error, message }
  },

  async getCreateTest({ dispatch, state }) {
    if (state.details.id) {
      const { app } = this.$router

      const { data, error } = await GetCreateTest(app.$axios, state.details.id)

      if (error) {
        app.$nuxt.error({
          message: 'Cannot create test. Try again',
          statusCode: 500,
        })
      } else {        
        dispatch('updateForm', {
          path: '',
          value: data,
          override: !!Object.keys(data || {}).length
        })
      }
    }
  },

  async getRecruit({ dispatch, state }) {
    if (state.details.id) {
      const { app } = this.$router

      const { data, error, message, status } = await GetRecruit(
        app.$axios,
        state.details.id
      )

      if (error) {
        app.$nuxt.error({
          message: message[0].content,
          statusCode: status,
        })
      } else {
        dispatch('updateDetails', data)
      }
    }
  },

  async publish({ dispatch, commit, state }) {
    if (state.details.id) {
      commit('setPublishing', true)

      const { app } = this.$router

      const { data, message } = await PublishTest(app.$axios, state.details.id)

      commit('setPublishing', false)

      showToasts(app.$pToast, message)

      if (data) {
        dispatch('updateDetails', data)
      }
    }
  },

  // updates published test switches basically
  async updateTestDetails({ dispatch, commit, state }, payload: UpdateTestDetailForm) {
    if (state.details.id) {
      commit('setLoading', true)

      const { app } = this.$router

      const { data, message } = await UpdateTestDetail(app.$axios, {
        ...payload,
        id: state.details.id
      })

      showToasts(app.$pToast, message)

      if (data) {
        dispatch('updateDetails', data)
      }
    }
  },
}

const getters: GetterTree<CreateTestState, RootState> = {
  questionsLength(state) {
    const questionKeys =
      Object.keys(state.form).filter((key) => questionKeysRegExp.test(key)) ||
      []

    return questionKeys.length
  },
  questions(state) {
    return Object.entries(state.form)
      .filter((entry) => questionKeysRegExp.test(entry[0]))
      .map((entry) => entry[1])
  },
}

export default {
  state,
  mutations,
  actions,
  getters,
}
