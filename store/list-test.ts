// eslint-disable-next-line import/named
import { MutationTree, ActionTree, GetterTree } from 'vuex'
import { RootState } from '.'
import { GetAllTestsResItem } from '~/server-middleware/routes/test-cRUD/getAllTests'
import { DeleteTest, GetAllTests } from '~/services/listTest'
import { showToasts } from '~/utils/showToast'
import { UpdateTestDetail } from '~/services/createTest'
import { DeleteTestForm } from '~/server-middleware/routes/test-cRUD/deleteTest'

export interface ListTestItem extends GetAllTestsResItem {
  loadingFavourite: boolean
  loadingRename: boolean
  loadingDelete: boolean
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

    const queryParam = app.$route.query

    const { data, message, error } = await GetAllTests(app.$axios, {
      favourite: queryParam.favourite === '1',
    })

    if (error) {
      showToasts(app.$pToast, message)
    } else {
      commit(
        'setItems',
        Object.values(data).map((val) => ({
          ...val,
          loadingFavourite: false,
          loadingRename: false,
          loadingDelete: false,
          shareLink: `${location.origin}/answer-test/${val.shareLink}/`,
          to: `/dashboard/create-test/${
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

    commit('setLoading', false)
  },

  async toggleFavourite({ commit, state }, id: string) {
    const item = state.items.find((x) => x.id === id)

    const { app } = this.$router

    if (item) {
      if (item.loadingFavourite) {
        return
      }

      // set test's loadingFavourite state
      commit('setItem', {
        id,
        value: {
          loadingFavourite: true,
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
          loadingFavourite: false,
        },
      })
    } else {
      app.$pToast.open({
        message: 'Test not found!',
        error: true,
      })
    }
  },

  async renameTest({ commit }, payload: { id: string; name: string }) {
    const { id, name } = payload

    commit('setItem', {
      id,
      value: {
        loadingRename: true,
      },
    })

    const { app } = this.$router

    const { data, error, message } = await UpdateTestDetail(app.$axios, {
      id,
      name,
    })

    if (data) {
      commit('setItem', {
        id,
        value: {
          name: data.name,
        },
      })
    }

    showToasts(app.$pToast, message)

    commit('setItem', {
      id,
      value: {
        loadingRename: false,
      },
    })

    return { data, error }
  },

  async deleteTest({ commit, state }, payload: DeleteTestForm) {
    const { id, dontWarn } = payload

    commit('setItem', {
      id,
      value: {
        loadingDelete: true,
      },
    })

    const { app } = this.$router

    const { data, message, error } = await DeleteTest(app.$axios, {
      id,
      dontWarn,
    })

    if (data) {
      commit(
        'setItems',
        state.items.filter((x) => x.id !== id)
      )
    }

    commit('setItem', {
      id,
      value: {
        loadingDelete: false,
      },
    })

    showToasts(app.$pToast, message)

    if (data.dontWarn) {
      app.$nextTick(() => {
        app.$store.commit('user/update', {
          deleteTestWarn: false,
        })
      })
    }

    return { data, message, error }
  },
}

const getters: GetterTree<AnswerTestState, RootState> = {
  hasFavourite(state) {
    return state.items.some((x) => x.favourite)
  },
  favourites(state) {
    return state.items.filter((x) => x.favourite)
  },
}

export default {
  state,
  mutations,
  actions,
  getters,
}
