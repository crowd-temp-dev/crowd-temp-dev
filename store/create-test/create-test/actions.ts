// eslint-disable-next-line import/named
import { ActionTree } from 'vuex'
import { nextTick } from '@vue/composition-api'
import { RootState } from '../..'
import { CreateTestForm, CreateTestState } from '.'
import { formBody, pingAddNewBlockBtn, sleep } from '~/utils'
import {
  CreateTest,
  GetCreateTest,
  GetRecruit,
  PublishTest,
  UpdateTestDetail,
} from '~/services/createTest'
import { showToasts } from '~/utils/showToast'
import { QuestionModelValue } from '~/components/App/CreateTest/Steps/FollowUpQuestion/Question/type'
import { UpdateTestDetailForm } from '~/server-middleware/routes/create-test/updateTestDetail'

const createTestAlertTitle = 'You have a test in progress!'

const actions: ActionTree<CreateTestState, RootState> = {
  setId({ commit, state }, id: string | null) {
    const getValue = (): string | undefined | null => {
      if (typeof id === 'string') {
        const { app } = this.$router

        if (
          state.details.id &&
          state.details.id !== id &&
          !state.form.empty &&
          !state.details.published
        ) {
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
          if (id !== state.details.id && state.details.id) {
            commit('resetForm')
          }

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

    const formatForm = formBody({
      fields: JSON.stringify({
        id: state.details.id,
        TestDetails: {
          ...rawForm.testDetails,
          name: state.details.name,
        },
        WelcomeScreen: rawForm.welcomeScreen,
        ThankYouScreen: rawForm.thankYouScreen,
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
                const id = question.id

                const getFiles = (value as File[]).flat()

                getFiles.forEach((file) => {
                  formatForm.append(id, file, file.name)
                })

                return [key, getFiles.length]
              }

              return [key, value]
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

        commit('setSubmitting', false)

        return {}
      }

      const { data, error, message } = await CreateTest(app.$axios, formatForm)

      commit('setSubmitting', false)

      app.$nextTick(() => {
        if (!error) {
          this.$router.push(`/create-test/recruit/${state.details.id}`)

          commit('resetForm')
        }

        showToasts(app.$pToast, message)
      })

      return { data, error, message }
    } else {
      return { error: { message: { content: 'Client only!' } } }
    }
  },

  async getCreateTest({ dispatch, commit, state }) {
    if (state.details.id) {
      const { app } = this.$router

      const { data, error } = await GetCreateTest(app.$axios, state.details.id)

      if (error) {
        app.$nuxt.error({
          message: 'Cannot create test. Try again',
          statusCode: 500,
        })
      } else if (data.details) {
        await dispatch('updateDetails', {
          data: data.details,
        })

        await dispatch('updateForm', {
          path: '',
          value: data.form,
          override: !!Object.keys(data.form || {}).length,
        })

        if (data.details.published) {
          commit('setShowWarning', true)
        } else {
          commit('setShowWarning', false)
        }
      } else {
        commit('updateDetails', {
          data: {
            name: 'New Test',
          },
        })

        commit('resetForm')

        commit('setShowWarning', false)
      }
    }
  },

  async getRecruit({ commit, dispatch, state }) {
    if (state.details.id) {
      commit('setLoading')

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
        dispatch('updateForm', {
          path: 'empty',
          value: false,
        }).then(() => {
          dispatch('updateDetails', { data })
        })
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
        dispatch('updateDetails', { data })
      }
    }
  },

  // updates published test switches basically
  async updateTestDetails({ dispatch, state }, payload: UpdateTestDetailForm) {
    if (state.details.id) {
      const { app } = this.$router

      const { data, message } = await UpdateTestDetail(app.$axios, {
        ...payload,
        id: state.details.id,
      })

      showToasts(app.$pToast, message)

      if (data) {
        dispatch('updateDetails', { data })
      }
    }
  },
}

export default actions
