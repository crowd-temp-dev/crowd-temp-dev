// eslint-disable-next-line import/named
import { MutationTree, ActionTree, GetterTree } from 'vuex'
import { RootState } from '..'

export interface TestSuiteDetail {
  loading: boolean
  error: boolean
  id: string
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
    } = payload

    state.description = description
    state.name = name
    state.published = published
    state.created = created
    state.responses = responses
    state.participants = participants
    state.shareLink = shareLink
    state.favourite = favourite
  },
}

const actions: ActionTree<TestSuiteDetail, RootState> = {
  setId({ commit }, id: string) {
    commit('setId', id)
  },
}

const getters: GetterTree<TestSuiteDetail, RootState> = {}

export default {
  state,
  mutations,
  actions,
  getters,
}
