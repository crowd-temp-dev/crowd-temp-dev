// eslint-disable-next-line import/named
import { MutationTree } from 'vuex'
import { QuestionModelValue } from '~/components/App/CreateProject/Steps/FollowUpQuestion/Question/type'
import { ProjectComponent, FiveSecondTestDurations } from '~/types'

export type FollowUpQuestions = QuestionModelValue[]

export interface TestSuiteCreateSectionItem {
  type: ProjectComponent
  id: string
  followUpQuestions?: FollowUpQuestions

  tasks?: [
    {
      id: string
      title: string
      followUpQuestions?: FollowUpQuestions
    }
  ]

  cards?: string[]
  categories?: string[]
  task?: string

  fileType?: 'image' | 'video'
  frameType?: 'no-frame'

  duration?: FiveSecondTestDurations[]

  websiteLink?: string

  prototypeLink?: string

  prototypeProvider?: 'figma'

  message?: string
  title?: string

  file?: File[]
  files?: File[][]
}

export interface TestSuiteCreateSectionState {
  items: TestSuiteCreateSectionItem[]
}

const state = (): TestSuiteCreateSectionState => ({
  items: [],
})

const mutations: MutationTree<TestSuiteCreateSectionState> = {
  add(
    state,
    payload: {
      data: TestSuiteCreateSectionItem
      index: number
    }
  ) {
    const { data, index = 0 } = payload

    state.items = [
      ...state.items.slice(0, index),
      data,
      ...state.items.slice(index),
    ]
  },

  remove(state, index: number) {
    state.items = state.items.filter((_, i) => i !== index)
  },

  update(state, payload: { index: string; data: TestSuiteCreateSectionItem }) {
    const { data, index } = payload

    state[index] = data
  },

  updateAll(state, payload: TestSuiteCreateSectionItem[]) {
    state.items = payload
  },
}

export default {
  state,
  mutations,
}
