// eslint-disable-next-line import/named
import { MutationTree } from 'vuex'

export interface WelcomeScreenState {
  title: string
  message: string
  buttonText: string
}

const state = (): WelcomeScreenState => ({
  title: null,
  message: null,
  buttonText: null,
})

const mutations: MutationTree<WelcomeScreenState> = {
  setData(
    state,
    payload: {
      title: string
      message: string
      buttonText: string
    }
  ) {
    console.log(state);
    
    const {
      message = state.message,
      buttonText = state.buttonText,
      title = state.title,
    } = payload

    state.title = title
    state.message = message
    state.buttonText = buttonText
  },
}

export default {
  state,
  mutations,
}
