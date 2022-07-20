import { MutationTree, ActionTree } from 'vuex'
import { nextTick } from '@vue/composition-api'
import { createTestAlertDialogId } from '../detail'
import welcomeScreen, { defaultWelcomeScreen } from './welcomeScreen'
import thankYouScreen from './thankYouScreen'
import section from './section'
import collapsed from './collapsed'
import { RootState } from '~/store'
import { formBody, pingAddNewBlockBtn, sleep, uuidv4 } from '~/utils'
import { CreateTest, GetCreateTest } from '~/services/createTest'
import { showToasts } from '~/utils/showToast'

export interface TestSuiteCreateState {
  submitting: boolean
  submitError: boolean
  loading: boolean
  showWarning: boolean
  empty: boolean
  welcomeScreen?: ReturnType<typeof welcomeScreen['state']>
  thankYouScreen?: ReturnType<typeof thankYouScreen['state']>
  section?: ReturnType<typeof section['state']>
  collapsed?: ReturnType<typeof collapsed['state']>
}

const state = (): TestSuiteCreateState => ({
  loading: false,
  submitError: false,
  submitting: false,
  showWarning: false,
  empty: true,
})

const mutations: MutationTree<TestSuiteCreateState> = {
  setSubmitting(state, val: boolean) {
    state.submitting = val
  },
  setSubmitError(state, val: boolean) {
    state.submitError = val
  },
  resetForm(state) {
    state.thankYouScreen = {
      title: '',
      message: '',
    }

    state.welcomeScreen = defaultWelcomeScreen()

    state.section.items = []

    state.collapsed.items = []
  },
  setShowWarning(state, val) {
    state.showWarning = val
  },
  setEmpty(state, val: boolean) {
    state.empty = val
  },
  populateQuestions(state, val: typeof state.section.items) {
    state.section.items = val
  },
}

const actions: ActionTree<TestSuiteCreateState, RootState> = {
  async resetForm({ commit, rootState }) {
    if (!(rootState.user.info || {}).id) {
      return
    }

    commit('resetForm')

    commit('setEmpty', true)

    const { app } = this.$router

    await app.$nextTick()

    app.$store.commit('testSuite/detail/setData', {
      published: false,
      name: 'New Test',
      description: '',
      created: false,
      userId: rootState.user.info.id,
    })
  },

  async submit({ commit, dispatch, state, rootState }, duplicate: boolean) {
    commit('setSubmitting', true)

    commit('setSubmitError', false)

    const questions = state.section.items

    if (!questions.length) {
      await pingAddNewBlockBtn()

      return {}
    }

    const { app } = this.$router

    await nextTick()

    const { detail } = rootState.testSuite

    const formatForm = formBody({
      fields: JSON.stringify({
        id: detail.id,
        TestDetails: {
          name: detail.name,
          description: detail.description,
        },
        WelcomeScreen: state.welcomeScreen,
        ThankYouScreen: state.thankYouScreen,
      }),
    })

    if (formatForm) {
      questions.forEach((question, index) => {
        const formFields = JSON.parse(formatForm.get('fields') as string)

        if (!formFields[question.type]) {
          formFields[question.type] = {} as Record<`${number}`, any>
        }

        formFields[question.type][`${index}`] = Object.fromEntries(
          Object.entries(question)
            .filter(([key]) => key !== 'type')
            .map(([key, value]) => {
              if (/^files?$/.test(key)) {
                const id = duplicate ? uuidv4() : question.id

                const getFiles = (value as File[]).flat()

                console.log({ getFiles })

                getFiles.forEach((file) => {
                  formatForm.append(id, file, file.name)
                })

                return [key, getFiles.length]
              }

              let getValue = value

              if (duplicate) {
                if (typeof value === 'string') {
                  getValue = uuidv4()
                } else if (Array.isArray(value)) {
                  value.forEach((item) => {
                    item.id = uuidv4()
                  })
                }
              }

              return [key, getValue]
            })
        )

        formatForm.set('fields', JSON.stringify(formFields))
      })

      if (
        Object.keys(JSON.parse(formatForm.get('fields') as string)).length < 4
      ) {
        await pingAddNewBlockBtn()

        app.$pToast.open({
          message: 'You must submit a question',
          error: true,
        })

        return {}
      }

      const submitTime = performance.now()

      const { data, error, message } = await CreateTest(app.$axios, formatForm)

      await sleep(performance.now() - submitTime >= 1000 ? 0 : 500)

      commit('setSubmitError', !!error)

      commit('setSubmitting', false)

      app.$nextTick(() => {
        if (!error) {
          if (duplicate) {
            this.$router.replace({
              params: {
                id: detail.id,
              },
            })
          } else {
            this.$router.push(`/dashboard/create-test/recruit/${detail.id}`)
          }

          dispatch('resetForm')

          showToasts(
            app.$pToast,
            duplicate
              ? [
                  {
                    content: 'Test duplicated!',
                    type: 'success',
                  },
                ]
              : message
          )
        } else {
          showToasts(app.$pToast, message)
        }
      })

      return { data, error, message }
    } else {
      return { error: { message: { content: 'Client only!' } } }
    }
  },

  async fetch({ dispatch, commit, rootState }) {
    const { id } = rootState.testSuite.detail

    if (id) {
      const { app } = this.$router

      const { data, error } = await GetCreateTest(app.$axios, id)

      if (error) {
        app.$nuxt.error({
          message: 'Cannot create test. Try again',
          statusCode: 500,
        })
      } else if (data.details.name) {
        commit('setEmpty', false)

        app.$store.commit('testSuite/detail/setData', {
          ...data.details,
          description: data.form.testDetails?.description || '',
          userId: (rootState.user.info || {}).id,
        })

        app.$store.commit(
          'testSuite/create/welcomeScreen/setData',
          data.form.welcomeScreen || {}
        )

        app.$store.commit(
          'testSuite/create/thankYouScreen/setData',
          data.form.thankYouScreen || {}
        )

        const questions = Object.entries(data.form)
          .filter(([key]) => {
            return /^question-\d+$/.test(key)
          })
          .map(([_, value]) => value)

        commit('populateQuestions', questions)

        if (data.details.participants) {
          commit('setShowWarning', true)
        } else {
          commit('setShowWarning', false)
        }
      } else {
        if (rootState.app.alertDialog.id !== createTestAlertDialogId) {
          dispatch('resetForm')
        }

        commit('setShowWarning', false)
      }
    }
  },

  async duplicate({ dispatch, rootState }) {
    const { app } = this.$router

    if (app.$route.name !== 'dashboard-create-test-:id') {
      app.$nuxt.error({
        message: 'Cannot duplicate test on this route!',
        statusCode: 403,
      })
    }

    const newId = uuidv4()

    app.$store.commit('testSuite/detail/setId', newId)

    await app.$nextTick()

    app.$store.commit('testSuite/detail/setData', {
      name: `${rootState.testSuite.detail.name} copy`,
      id: newId,
      userId: (rootState.user.info || {}).id,
    })

    await app.$nextTick()

    await dispatch('submit', true)
  },
}

export default {
  state,
  mutations,
  actions,

  modules: {
    welcomeScreen,
    thankYouScreen,
    section,
    collapsed,
  },
}
