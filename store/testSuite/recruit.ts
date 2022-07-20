// eslint-disable-next-line import/named
import { MutationTree, ActionTree } from 'vuex'
import { RootState } from '..'
import {
  GetRecruit,
  PublishTest,
  UpdateTestDetail,
} from '~/services/createTest'
import { showToasts } from '~/utils/showToast'
import { UpdateTestDetailForm } from '~/server-middleware/routes/create-test/updateTestDetail'
import { removeUndefinedValues } from '~/utils'

export interface TestSuiteRecruit {
  loading: boolean
  error: boolean
  publishing: boolean
  unlimitedInvites: boolean
  stopAcceptingResponse?: boolean
}

export type TestSuiteRecruitState = TestSuiteRecruit

const state = (): TestSuiteRecruitState => ({
  loading: false,
  error: false,
  publishing: false,
  unlimitedInvites: false,
  stopAcceptingResponse: false,
})

const mutations: MutationTree<TestSuiteRecruit> = {
  setLoading(state, val: boolean) {
    state.loading = val
  },
  setError(state, val: boolean) {
    state.error = val
  },
  setPublishing(state, val: boolean) {
    state.publishing = val
  },
  setData(
    state,
    payload: {
      unlimitedInvites: boolean
      stopAcceptingResponse: boolean
    }
  ) {
    const {
      unlimitedInvites = state.unlimitedInvites,
      stopAcceptingResponse = state.stopAcceptingResponse,
    } = payload

    state.unlimitedInvites = unlimitedInvites
    state.stopAcceptingResponse = stopAcceptingResponse
  },
}

const actions: ActionTree<TestSuiteRecruit, RootState> = {
  async fetch({ commit, rootState }) {
    const { id } = rootState.testSuite.detail

    if (id) {
      commit('setLoading', true)

      const { app } = this.$router

      const { data, error, message, status } = await GetRecruit(app.$axios, id)

      if (error) {
        app.$nuxt.error({
          message: message[0].content,
          statusCode: status,
        })
      } else {
        app.$store.commit('testSuite/create/setEmpty', false)

        const {
          name,
          participants,
          published,
          responses,
          shareLink,
          stopAcceptingResponse,
          unlimitedInvites,
          created,
        } = data

        app.$store.commit(
          'testSuite/detail/setData',
          removeUndefinedValues({
            name,
            participants,
            published,
            responses,
            shareLink,
            created,
            userId: (rootState.user.info || {}).id,
          })
        )

        commit('setData', {
          stopAcceptingResponse,
          unlimitedInvites,
        })
      }

      commit('setLoading', false)
    }
  },

  async publish({ commit, rootState }) {
    const { id } = rootState.testSuite.detail

    if (id) {
      commit('setPublishing', true)

      const { app } = this.$router

      const { data, message } = await PublishTest(app.$axios, id)

      commit('setPublishing', false)

      showToasts(app.$pToast, message)

      if (data) {
        const {
          published,
          shareLink,
          stopAcceptingResponse,
          unlimitedInvites,
        } = data

        commit('setData', {
          stopAcceptingResponse,
          unlimitedInvites,
        })

        app.$store.commit(
          'testSuite/detail/setData',
          removeUndefinedValues({
            published,
            shareLink,
            userId: (rootState.user.info || {}).id,
          })
        )
      }
    }
  },

  // updates published test switches basically
  async update({ commit, rootState }, payload: UpdateTestDetailForm) {
    const { id } = rootState.testSuite.detail

    if (id) {
      const { app } = this.$router

      const { data, message } = await UpdateTestDetail(app.$axios, {
        ...payload,
        id,
      })

      showToasts(app.$pToast, message)

      if (data) {
        const {
          favourite,
          published,
          shareLink,
          stopAcceptingResponse,
          unlimitedInvites,
        } = data

        commit('setData', {
          stopAcceptingResponse,
          unlimitedInvites,
        })

        app.$store.commit(
          'testSuite/detail/setData',
          removeUndefinedValues({
            published,
            shareLink,
            favourite,
          })
        )
      }
    }
  },
}

export default {
  state,
  mutations,
  actions,
}
