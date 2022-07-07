// eslint-disable-next-line import/named
import { MutationTree, ActionTree } from 'vuex'
import { RootState } from '.'
import { PrivacyAndPolicy } from '~/database/models/PrivacyAndPolicy/PrivacyAndPolicies'
import { GetPrivacyAndPolicies } from '~/services/privacyAndPolicies'

export interface PrivacyAndPolicyState {
  loading: boolean
  content: {
    updatedAt: PrivacyAndPolicy['updatedAt']
    sections: PrivacyAndPolicy['sections']
    intro: PrivacyAndPolicy['intro']
  }
}

const state = (): PrivacyAndPolicyState => ({
  loading: false,
  content: null,
})

const mutations: MutationTree<PrivacyAndPolicyState> = {
  setLoading(state, val?: boolean) {
    state.loading = typeof val === 'boolean' ? val : true
  },
  setContent(state, val: PrivacyAndPolicyState['content']) {
    state.content = val

    state.loading = false
  },
}

const actions: ActionTree<PrivacyAndPolicyState, RootState> = {
  async getContent({ commit, state }) {
    if (state.content) {
      return {
        data: state.content,
      }
    }

    commit('setLoading', !state.content)

    const { app } = this.$router

    const { data, error, message, status } = await GetPrivacyAndPolicies(
      app.$axios,
      null
    )

    if (error) {
      app.$nuxt.error({
        message: message?.[0].content || 'Error fetching policies!',
        statusCode: status,
      })
    } else {
      commit('setContent', data[0])
    }

    return { data, error, message, status }
  },
}

export default {
  state,
  mutations,
  actions,
}
