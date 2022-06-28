import { ServiceHandler } from './type'
import { validateStatus } from './utils'
import { CreateTestRes } from '~/server-middleware/routes/create-test/createTest'
import { CreateTestForm } from '~/types/form'
import { CreateTestState } from '~/store/create-test'
import { UpdateTestDetailForm } from '~/server-middleware/routes/create-test/updateTestDetail'
import { ViewResultState } from '~/store/create-test/view-result'

export const CreateTest: ServiceHandler<
  Record<string, any>,
  CreateTestRes
> = async (axios, payload) => {
  return await axios.$post('createTest/create', payload, validateStatus)
}

// get test for /create-test/?:id
export const GetCreateTest: ServiceHandler<string, CreateTestForm> = async (
  axios,
  id
) => {
  return await axios.$get(`/create-test/${id}`, {
    ...validateStatus,
  })
}

// get test for /create-test/recruit/?:id
export const GetRecruit: ServiceHandler<string, CreateTestForm> = async (
  axios,
  id
) => {
  return await axios.$get(`/create-test/recruit/${id}`, {
    ...validateStatus,
  })
}

// get test for /create-test/view-result/?:id
export const GetViewResult: ServiceHandler<
  string,
  {
    responses: ViewResultState['responses']
    questions: ViewResultState['questions']
    answers: ViewResultState['answers']
  }
> = async (axios, id) => {
  return await axios.$get(`/create-test/view-result/${id}`, {
    ...validateStatus,
  })
}

// publish test
export const PublishTest: ServiceHandler<
  string,
  CreateTestState['details']
> = async (axios, id) => {
  return await axios.$post('/create-test/publish', { id }, validateStatus)
}

// update test detail
export const UpdateTestDetail: ServiceHandler<
  UpdateTestDetailForm,
  CreateTestState['details']
> = async (axios, payload) => {
  return await axios.$patch('/create-test/updateDetail', payload, {
    ...validateStatus,
    progress: false,
  })
}
