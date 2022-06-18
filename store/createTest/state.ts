import { CreateTestComponent } from '~/types'

export interface Progress {
  done: number[]
  current: number
}

export interface TestIndex {
  title: string
  id: string
  component: CreateTestComponent
  data: Record<string, any>
  expanded: boolean
}

export interface CreateTestState {
  progress: Progress
  testIndex: TestIndex[]
}

export default function state() {
  return {
    progress: {
      done: [],
      current: 1,
    },

    // This holds the indexes of sorting.
    // So when a new test section is created, a uid should be added here
    testIndex: [],
  } as CreateTestState
}
