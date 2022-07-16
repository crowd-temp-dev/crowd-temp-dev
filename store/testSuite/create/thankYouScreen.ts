// eslint-disable-next-line import/named
import { MutationTree } from 'vuex'

export interface ThankYouScreenState {
  title: string
  message: string
}

const state = (): ThankYouScreenState => ({
  title: '',
  message: '',
})

const mutations: MutationTree<ThankYouScreenState> = {
  setData(
    state,
    payload: {
      title: string
      message: string
    }
  ) {
    const { message = state.message, title = state.title } = payload

    state.title = title
    state.message = message
  },
}

export default {
  state,
  mutations,
}
