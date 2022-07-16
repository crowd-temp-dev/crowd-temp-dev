import { MutationTree, ActionTree } from 'vuex'
import { nextTick } from '@vue/composition-api'
import welcomeScreen from './welcomeScreen'
import thankYouScreen from './thankYouScreen'
import section from './section'
import collapsed from './collapsed'
import { RootState } from '~/store'
import { formBody, pingAddNewBlockBtn, sleep, uuidv4 } from '~/utils'
import { CreateTest } from '~/services/createTest'
import { showToasts } from '~/utils/showToast'

export interface TestSuiteCreateState {
  submitting: boolean
  loading: boolean
  welcomeScreen?: ReturnType<typeof welcomeScreen['state']>
  thankYouScreen?: ReturnType<typeof thankYouScreen['state']>
  section?: ReturnType<typeof section['state']>
  collapsed?: ReturnType<typeof collapsed['state']>
}

const state = (): TestSuiteCreateState => ({
  loading: false,
  submitting: false,
})

const mutations: MutationTree<TestSuiteCreateState> = {
  setSubmitting(state, val: boolean) {
    state.submitting = val
  },
  resetForm(state) {
    state.thankYouScreen = {
      title: '',
      message: '',
    }

    state.welcomeScreen = {
      buttonText: '',
      message: '',
      title: '',
    }

    state.section.items = []

    state.collapsed.items = []
  },
}

const actions: ActionTree<TestSuiteCreateState, RootState> = {
  async resetForm({ commit }) {
    commit('resetForm')

    const { app } = this.$router

    await app.$nextTick()

    app.$store.commit('testSuite/detail/setData', {
      published: false,
      name: 'New Test',
      description: '',
      created: false,
    })
  },

  async submit({ commit, dispatch, state, rootState }, duplicate: boolean) {
    commit('setSubmitting', true)

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

      commit('setSubmitting', true)

      const submitTime = performance.now()

      const { data, error, message } = await CreateTest(app.$axios, formatForm)

      await sleep(performance.now() - submitTime > 1000 ? 0 : 500)

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
            this.$router.push(`/create-test/recruit/${detail.id}`)
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
