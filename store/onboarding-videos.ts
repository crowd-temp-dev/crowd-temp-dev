// eslint-disable-next-line import/named
import { MutationTree, ActionTree, GetterTree } from 'vuex'
import { RootState } from '.'
import { GetAllTestsResItem } from '~/server-middleware/routes/test-cRUD/getAllTests'

import {
  GetOnboardingVideoRating,
  RateOnboardingVideo,
} from '~/services/onboardingVideo'

export interface ListTestItem extends GetAllTestsResItem {
  loading: boolean
}

export interface OnboardingVideoState {
  loading: boolean
  error: boolean
  items: {
    main: number
    video1: number
    video2: number
    video3: number
    video4: number
  }
}

const state = (): OnboardingVideoState => ({
  loading: false,
  error: false,
  items: {
    main: null,
    video1: null,
    video2: null,
    video3: null,
    video4: null,
  },
})

const mutations: MutationTree<OnboardingVideoState> = {
  setLoading(state, val?: boolean) {
    state.loading = typeof val === 'boolean' ? val : true
  },
  setError(state, val: boolean) {
    state.error = val
  },
  setItem(state, payload: OnboardingVideoState['items']) {
    state.items = {
      ...state.items,
      ...payload,
    }

    console.log({ payload })
    

    state.error = false
    state.loading = false
  },
}

const actions: ActionTree<OnboardingVideoState, RootState> = {
  async getItems({ commit }) {
    commit('setLoading')

    const { app } = this.$router

    const { data, error } = await GetOnboardingVideoRating(app.$axios, null)

    if (error) {
      commit('setError')
    } else {
      commit('setItem', data)
    }
  },
  async rateItem(
    { commit, state },
    payload: {
      key: 'main' | `video${'1' | '2' | '3' | '4' | '5'}`
      value: number
    }
  ) {
    const { key, value } = payload

    const { app } = this.$router

    const { data, error } = await RateOnboardingVideo(app.$axios, {
      ...state.items,
      [key]: value,
    })

    if (error) {
      commit('setError')
    } else {
      commit('setItem', data)
    }
  },
}

const getters: GetterTree<OnboardingVideoState, RootState> = {}

export default {
  state,
  mutations,
  actions,
  getters,
}