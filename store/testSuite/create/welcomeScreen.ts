// eslint-disable-next-line import/named
import { MutationTree } from 'vuex'

export interface WelcomeScreenState {
  title: string
  message: string
  buttonText: string
}

export const defaultWelcomeScreen = () => ({
  buttonText: 'Get started',
  message:
    "You've been invited to take a short test. Your test contains more than one section, please pay attention to the instructions before each section. Also note that you can only answer each question once.",
  title: 'Hi there 👋,',
})

const state = (): WelcomeScreenState => defaultWelcomeScreen()

const mutations: MutationTree<WelcomeScreenState> = {
  setData(
    state,
    payload: {
      title: string
      message: string
      buttonText: string
    }
  ) {
    console.log(state)

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
