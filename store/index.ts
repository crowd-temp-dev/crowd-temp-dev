import app from './app'
import user from './user'
import _createTest from './createTest'
import createTest from './create-test'
import answerTest from './answer-test'

export interface RootState {
  app: ReturnType<typeof app['state']>
  user: ReturnType<typeof user['state']>
  createTest: ReturnType<typeof _createTest['state']>
  'create-test': ReturnType<typeof createTest['state']>
  'answer-test': ReturnType<typeof answerTest['state']>
}

export default {
  modules: {
    app,
    user,
    createTest: _createTest,
    'create-test': createTest,
    'answer-test': answerTest,
  },
  strict: false,
}
