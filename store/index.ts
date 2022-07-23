import app from './app'
import user from './user'
import answerTest from './answer-test'
import listTest from './list-test'
import privacyAndPolicies from './privacy-and-policies'
import onboardingVideos from './onboarding-videos'
import projectSuite, { TestSuiteState } from './projectSuite'

export interface RootState {
  app: ReturnType<typeof app['state']>
  user: ReturnType<typeof user['state']>
  projectSuite: TestSuiteState
  'answer-test': ReturnType<typeof answerTest['state']>
  'list-test': ReturnType<typeof listTest['state']>
  'privacy-and-policies': ReturnType<typeof privacyAndPolicies['state']>
}

export default {
  modules: {
    app,
    user,
    projectSuite,
    'answer-test': answerTest,
    'list-test': listTest,
    'privacy-and-policies': privacyAndPolicies,
    'onboarding-videos': onboardingVideos,
  },
  strict: false,
}
