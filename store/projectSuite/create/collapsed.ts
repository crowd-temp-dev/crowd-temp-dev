// eslint-disable-next-line import/named
import { MutationTree } from 'vuex'

export interface TestSuiteCollapsed {
  items: string[]
}

const state = (): TestSuiteCollapsed => ({
  items: [],
})

const mutations: MutationTree<TestSuiteCollapsed> = {
  add(state, id: string) {
    state.items = [...state.items, id]
  },

  remove(state, id: string) {
    state.items = state.items.filter((val) => val !== id)
  },

  reset(state) {
    state.items = []
  },
}

export default {
  state,
  mutations,
}
