import detail from './detail'
import create, { TestSuiteCreateState } from './create'

export interface TestSuiteState {
  detail: ReturnType<typeof detail['state']>
  create: TestSuiteCreateState
}

export default {
  modules: {
    detail,
    create,
  },
}
