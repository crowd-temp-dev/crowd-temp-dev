// eslint-disable-next-line import/named
import { MutationTree, ActionTree } from 'vuex'
import { RootState } from '..'
import { CreateTestForm } from '.'
import { GetViewResult, UpdateResultAnswer } from '~/services/createTest'
import { showToasts } from '~/utils/showToast'
import { CreateTestTypes } from '~/types'
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
  cardSorting?: {
    items: string[]
    title: string
  }[]
  questions: Record<string, QuestionAnswer>
}

export interface TestSuiteUser {
  username: string
  done: boolean
  id: string
  answers: Record<`${number}`, TestAnswer>
}

export interface TestSuiteViewResultState {
  id: string
  loading: boolean
  responses: number
  questions: CreateTestForm
  answers: TestSuiteUser[]
  testDetails: CreateTestForm['testDetails']
}

export interface UpdateAnswerPayload extends UpdateResultAnswerForm {
  userIndex: number
}

const state = (): TestSuiteViewResultState => ({
  id: '',
  loading: true,
  responses: 0,
  questions: {} as CreateTestForm,
  answers: [] as TestSuiteUser[],
  testDetails: {} as CreateTestForm['testDetails'],
})

const mutations: MutationTree<TestSuiteViewResultState> = {
  setLoading(state, val?: boolean) {
    state.loading = typeof val === 'boolean' ? val : true
  },
  setId(state, id: string) {
    state.id = id
  },
  saveAnswers(
    state,
    val: {
      responses: TestSuiteViewResultState['responses']
      questions: TestSuiteViewResultState['questions']
      answers: TestSuiteViewResultState['answers']
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

const actions: ActionTree<TestSuiteViewResultState, RootState> = {
  async fetch({ commit }) {
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
      app.$store.commit('testSuite/detail/setData', {
        published: true,
        name: data.questions.testDetails.name,
        responses: data.responses,
        created: true,
      })

      app.$store.commit('testSuite/create/setEmpty', false)

      commit('saveAnswers', data)
    }

    commit('setLoading', false)

    await app.$nextTick()

    commit('setId', paramId)

    app.$store.commit('testSuite/detail/setId', paramId)

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

export default {
  state,
  mutations,
  actions,
}
