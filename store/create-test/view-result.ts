// eslint-disable-next-line import/named
import { MutationTree, ActionTree, GetterTree } from 'vuex'
import { RootState } from '..'
import { CreateTestForm } from '.'
import { GetViewResult, UpdateResultAnswer } from '~/services/createTest'
import { CreateTestTypes } from '~/types'
import { showToasts } from '~/utils/showToast'
import { UpdateResultAnswerForm } from '~/server-middleware/routes/create-test/updateResultAnswer'

export interface QuestionAnswer {
  id: string
  type: string
  value?: any[]
  skip?: boolean
  loading?: boolean
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
  id: string
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

export interface UpdateAnswerPayload extends UpdateResultAnswerForm {
  userIndex: number
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
  updateAnswer(state, payload: UpdateAnswerPayload) {
    const { qIndex, userIndex, followUpAlpha, values } = payload

    const answer =
      state.answers[userIndex].answers[qIndex].questions[followUpAlpha]

    state.answers[userIndex].answers[qIndex].questions[followUpAlpha] = {
      ...answer,
      ...values,
    }
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

    app.$store.commit('create-test/setId', paramId)

    return { data, message, status, error }
  },

  async updateAnser({ commit, state }, payload: UpdateAnswerPayload) {
    const { qIndex, userIndex, followUpAlpha, values } = payload

    const toggleLoading = (loading: boolean) => {
      commit('updateAnswer', {
        qIndex,
        userIndex,
        followUpAlpha,
        values: { loading },
      })
    }

    toggleLoading(true)

    const { app } = this.$router

    const user = state.answers[userIndex]

    const { data, error, message } = await UpdateResultAnswer(app.$axios, {
      qIndex,
      followUpAlpha,
      id: user.id,
      values,
    })

    toggleLoading(false)

    await app.$nextTick()

    if (data) {
      commit('updateAnswer', {
        qIndex,
        userIndex,
        followUpAlpha,
        values,
      })
    }

    showToasts(app.$pToast, message)

    return { data, error, message }
  },
}

const getters: GetterTree<ViewResultState, RootState> = {}

export default {
  state,
  mutations,
  actions,
  getters,
}
