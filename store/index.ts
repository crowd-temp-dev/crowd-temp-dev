import app from './app'
import user from './user'
import _createTest from './createTest'
import createTest from './create-test/create-test'
import answerTest from './answer-test'
import listTest from './list-test'
import privacyAndPolicies from './privacy-and-policies'
import onboardingVideos from './onboarding-videos'
import testSuite, { TestSuiteState } from './testSuite'

export interface RootState {
  app: ReturnType<typeof app['state']>
  user: ReturnType<typeof user['state']>
  testSuite: TestSuiteState
  createTest: ReturnType<typeof _createTest['state']>
  'create-test': ReturnType<typeof createTest['state']>
  'answer-test': ReturnType<typeof answerTest['state']>
  'list-test': ReturnType<typeof listTest['state']>
  'privacy-and-policies': ReturnType<typeof privacyAndPolicies['state']>
}

export default {
  modules: {
    app,
    user,
    testSuite,
    createTest: _createTest,
    'create-test': createTest,
    'answer-test': answerTest,
    'list-test': listTest,
    'privacy-and-policies': privacyAndPolicies,
    'onboarding-videos': onboardingVideos,
  },
  strict: false,
}
