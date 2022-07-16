import detail from './detail'
import create, { TestSuiteCreateState } from './create'
import recruit from './recruit'
import viewResult from './viewResult'

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
