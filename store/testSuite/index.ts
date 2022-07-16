import detail from './detail'
import create, { TestSuiteCreateState } from './create'
import recruit from './recruit'
import viewResult from './viewResult'
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


export interface TestSuiteState {
  detail: ReturnType<typeof detail['state']>
  create: TestSuiteCreateState
  recruit: ReturnType<typeof recruit['state']>
  viewResult: ReturnType<typeof viewResult['state']>
}

export default {
  modules: {
    detail,
    create,
    recruit,
    viewResult,
  },
}
