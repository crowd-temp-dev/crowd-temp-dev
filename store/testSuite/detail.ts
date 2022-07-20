// eslint-disable-next-line import/named
import { MutationTree, ActionTree, GetterTree } from 'vuex'
import { RootState } from '..'
import { sleep, uid } from '~/utils'

export interface TestSuiteDetail {
  loading: boolean
  error: boolean
  id: string
  userId: string
  name: string
  published: boolean
  description: string
  created: boolean
  participants: number
  responses: number
  shareLink: string
  favourite: boolean
}

const state = (): TestSuiteDetail => ({
  loading: false,
  error: false,
  id: null,
  userId: null,
  name: '',
  published: null,
  description: null,
  created: false,
  participants: null,
  responses: null,
  shareLink: null,
  favourite: null,
})

const mutations: MutationTree<TestSuiteDetail> = {
  setLoading(state, val?: boolean) {
    state.loading = typeof val === 'boolean' ? val : true
  },
  setError(state, val: boolean) {
    state.error = val
  },
  setId(state, id: string) {
    state.id = id
  },
  setData(
    state,
    payload: {
      userId?: string
      published?: boolean
      name?: string
      description?: string
      created?: boolean
      participants?: number
      responses?: number
      shareLink?: string
      favourite?: boolean
    }
  ) {
    const {
      published = state.published,
      description = state.description,
      name = state.name,
      created = state.created,
      responses = state.responses,
      participants = state.participants,
      shareLink = state.shareLink,
      favourite = state.favourite,
      userId = state.userId,
    } = payload

    state.description = description
    state.name = name
    state.published = published
    state.created = created
    state.responses = responses
    state.participants = participants
    state.shareLink = shareLink
    state.favourite = favourite
    state.userId = userId
  },
}

const createTestAlertTitle = 'You have an unsaved test!'

export const createTestAlertDialogId = uid()

const actions: ActionTree<TestSuiteDetail, RootState> = {
  setId({ commit, state, rootState }, id: string) {
    const { app } = this.$router

    const hasUnfinishedTest =
      (rootState.user.info || {}).id === state.id &&
      !state.created &&
      id !== state.id &&
      !!rootState.testSuite.create.section.items.length

    const setId = () => {
      commit('setId', id)
    }

    if (hasUnfinishedTest) {
      const alertId = {
        id: createTestAlertDialogId,
      }

      app.$store.commit('app/updateAlertDialog', alertId)

      sleep(250).then(() => {
        if (app.$route.name === 'dashboard-create-test-:id') {
          app.$alert.open({
            ...alertId,
            title: createTestAlertTitle,
            subtitle: 'Creating a new test will clear your previous progress.',
            actions: [
              {
                label: 'Create new test',
                attrs: {
                  plain: true,
                  destructive: true,
                },
                events: {
                  click: () => {
                    setId()

                    app.$store.dispatch('testSuite/create/resetForm')

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
                    if (app.$route.params.id !== state.id) {
                      app.$router.replace({
                        params: {
                          id: state.id as string,
                        },
                      })
                    }

                    app.$alert.close()
                  },
                },
              },
            ],
          })
        } else {
          app.$store.commit('app/updateAlertDialog', {
            id: '',
          })

          setId()
        }
      })
    } else {
      setId()
    }
  },
}

const getters: GetterTree<TestSuiteDetail, RootState> = {}

export default {
  state,
  mutations,
  actions,
  getters,
}
