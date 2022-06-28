// eslint-disable-next-line import/named
import { MutationTree, ActionTree, GetterTree } from 'vuex'
import { RootState } from '..'
import { CreateTestForm } from '.'
import { GetViewResult } from '~/services/createTest'
import { CreateTestTypes } from '~/types'
import { showToasts } from '~/utils/showToast'

export interface QuestionAnswer {
  id: string
  type: string
  value?: any[]
  skip?: boolean
}

export interface TestAnswer {
  type: CreateTestTypes
  preference?: {
    file: string
    index: number
  }
  questions: Record<string, QuestionAnswer>
}

export interface TestSuite {
  username: string
  done: boolean
  answers: Record<`${number}`, TestAnswer>
}

export interface ViewResultState {
  id: string
  loading: boolean
  responses: number
  questions: CreateTestForm
  answers: TestSuite[]
  testDetails: CreateTestForm['testDetails']
}

const state = (): ViewResultState => ({
  id: '',
  loading: true,
  responses: 0,
  questions: {} as CreateTestForm,
  answers: [] as TestSuite[],
  testDetails: {} as CreateTestForm['testDetails'],
})

const mutations: MutationTree<ViewResultState> = {
  setLoading(state, val?: boolean) {
    state.loading = typeof val === 'boolean' ? val : true
  },
  setId(state, id: string) {
    state.id = id
  },
  saveAnswers(
    state,
    val: {
      responses: ViewResultState['responses']
      questions: ViewResultState['questions']
      answers: ViewResultState['answers']
    }
  ) {
    const { responses, questions, answers } = val

    state.responses = responses
    state.questions = questions
    state.answers = answers
    state.testDetails = questions.testDetails

    state.loading = false
  },
}

const actions: ActionTree<ViewResultState, RootState> = {
  async getResult({ commit }) {
    commit('setLoading', true)

    const { app } = this.$router

    const paramId = app.$route.params.id

    const { data, message, status, error } = await GetViewResult(
      app.$axios,
      paramId
    )

    if (error) {
      app.$nuxt.error({
        message: message[0].content,
        statusCode: status,
      })

      showToasts(app.$pToast, message)
    } else {
      commit('saveAnswers', data)
    }

    await app.$nextTick()

    commit('setId', paramId)

    return { data, message, status, error }
  },
}

const getters: GetterTree<ViewResultState, RootState> = {}

export default {
  state,
  mutations,
  actions,
  getters,
}
