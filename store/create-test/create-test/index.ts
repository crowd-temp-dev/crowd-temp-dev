// eslint-disable-next-line import/named
import { GetterTree } from 'vuex'
import { RootState } from '../..'
import viewResult, { ViewResultState } from '../view-result'
import actions from './actions'
import mutations from './mutations'
import { CreateTestFormQuestion } from '~/types/form'

export interface CreateTestForm {
  testDetails: {
    name: string
    description: string
  }

  welcomeScreen: {
    title: string
    message: string
    buttonText: string
  }

  thankYouScreen: {
    title: string
    message: string
  }

  [key: `question-${number}`]: CreateTestFormQuestion

  empty?: boolean
}

export interface CreateTestState {
  details: {
    id: string | null
    published?: boolean
    shareLink?: string
    unlimitedInvites?: boolean
    stopAcceptingResponse?: boolean
    responses?: number
    favourite?: boolean
    name?: string
  }
  form: CreateTestForm
  loading: boolean
  pageLoading: boolean
  submitting: boolean
  publishing: boolean
  showWarning: boolean
  'view-result'?: ViewResultState
}

export const freshForm = () =>
  ({
    testDetails: {
      description: '',
    },
    welcomeScreen: {
      buttonText: 'Get started',
      message:
        "You've been invited to take a short test. Your test contains more than one section, please pay attention to the instructions before each section. Also note that you can only answer each question once.",
      title: 'Hi there 👋,',
    },
    thankYouScreen: {
      message: '',
      title: '',
    },
    empty: true,
  } as CreateTestForm)

const questionKeysRegExp = /^question-\d$/

const state = (): CreateTestState => ({
  form: freshForm(),
  loading: false,
  submitting: false,
  details: {
    id: null,
  },
  publishing: false,
  pageLoading: true,
  showWarning: false,
})

const getters: GetterTree<CreateTestState, RootState> = {
  questionsLength(state) {
    const questionKeys =
      Object.keys(state.form).filter((key) => questionKeysRegExp.test(key)) ||
      []

    return questionKeys.length
  },
  questions(state) {
    return Object.entries(state.form)
      .filter((entry) => questionKeysRegExp.test(entry[0]))
      .map((entry) => entry[1])
  },
}

export default {
  state,
  mutations,
  actions,
  getters,
  modules: {
    'view-result': viewResult,
  },
}
