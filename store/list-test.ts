// eslint-disable-next-line import/named
import { MutationTree, ActionTree, GetterTree } from 'vuex'
import { RootState } from '.'
import { GetAllTestsRes } from '~/server-middleware/routes/view-test/getAllTests'
import { GetAllTests } from '~/services/listTest'
import { showToasts } from '~/utils/showToast'

export interface AnswerTestState {
  loading: boolean
  items: GetAllTestsRes
}

const state = (): AnswerTestState => ({
  loading: false,
  items: [],
})

const mutations: MutationTree<AnswerTestState> = {
  setLoading(state, val?: boolean) {
    state.loading = typeof val === 'boolean' ? val : true
  },
  setItems(state, val: GetAllTestsRes) {
    state.items = Object.values(val)

    state.loading = false
  },
}

const actions: ActionTree<AnswerTestState, RootState> = {
  async getAllTests({ commit }) {
    commit('setLoading', true)

    const { app } = this.$router

    const { data, message, error } = await GetAllTests(app.$axios, {})

    if (error) {
      showToasts(app.$pToast, message)
    } else {
      commit(
        'setItems',
        Object.values(data).map((val) => ({
          ...val,
          shareLink: `${location.origin}/answer-test/${val.shareLink}/`,
          responses: val.TestAnswers.filter((x) => x.done).length,
          to: `create-test/${
            val.progress === 'Draft: Create'
              ? ''
              : val.progress === 'Draft: Recruit'
              ? 'recruit'
              : 'view-result'
          }/${val.id}`,
        }))
      )
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
