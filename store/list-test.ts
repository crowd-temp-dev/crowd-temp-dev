// eslint-disable-next-line import/named
import { MutationTree, ActionTree, GetterTree } from 'vuex'
import { RootState } from '.'
import { GetAllTestsResItem } from '~/server-middleware/routes/test-cRUD/getAllTests'
import { GetAllTests } from '~/services/listTest'
import { showToasts } from '~/utils/showToast'
import { UpdateTestDetail } from '~/services/createTest'

export interface ListTestItem extends GetAllTestsResItem {
  loading: boolean
}

export interface AnswerTestState {
  loading: boolean
  items: ListTestItem[]
}

const state = (): AnswerTestState => ({
  loading: false,
  items: [],
})

const mutations: MutationTree<AnswerTestState> = {
  setLoading(state, val?: boolean) {
    state.loading = typeof val === 'boolean' ? val : true
  },
  setItems(state, val: ListTestItem) {
    state.items = Object.values(val)

    state.loading = false
  },
  setItem(state, val: { id: string; value: Record<string, any> }) {
    state.items = state.items.map((item) => {
      if (item.id === val.id) {
        return {
          ...item,
          ...val.value,
        }
      }

      return item
    })
  },
}

const actions: ActionTree<AnswerTestState, RootState> = {
  async getAllTests({ commit, dispatch }) {
    commit('setLoading', true)

    const { app } = this.$router

    const queryParam = app.$route.query;

    const { data, message, error } = await GetAllTests(app.$axios, {
      favourite: queryParam.favourite === '1'
    })

    if (error) {
      showToasts(app.$pToast, message)
    } else {
      commit(
        'setItems',
        Object.values(data).map((val) => ({
          ...val,
          loading: false,
          shareLink: `${location.origin}/answer-test/${val.shareLink}/`,
          responses: val.TestAnswers.filter((x) => x.done).length,
          to: `create-test/${
            val.progress === 'Draft: Create'
              ? ''
              : val.progress === 'Draft: Recruit'
              ? 'recruit'
              : 'view-result'
          }/${val.id}`,
          toggleFavourite: async () =>
            await dispatch('toggleFavourite', val.id),
        }))
      )
    }
  },

  async toggleFavourite({ commit, state }, id: string) {
    const item = state.items.find((x) => x.id === id)

    const { app } = this.$router

    if (item) {
      if (item.loading) {
        return
      }

      // set test's loading state
      commit('setItem', {
        id,
        value: {
          loading: true,
        },
      })

      const { data, error, message } = await UpdateTestDetail(app.$axios, {
        id,
        favourite: !item.favourite,
      })

      error && showToasts(app.$pToast, message)

      if (data) {
        commit('setItem', {
          id,
          value: {
            favourite: data.favourite,
          },
        })
      }

      commit('setItem', {
        id,
        value: {
          loading: false,
        },
      })
    } else {
      app.$pToast.open({
        message: 'Test not found!',
        error: true,
      })
    }
  },
}

const getters: GetterTree<AnswerTestState, RootState> = {
  hasFavourite(state) {
    return state.items.some(x => x.favourite)
  },
  favourites(state) {
    return state.items.filter(x => x.favourite)
  }
}

export default {
  state,
  mutations,
  actions,
  getters,
}
