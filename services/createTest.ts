import { ServiceHandler } from './type'
import { validateStatus } from './utils'
import { CreateTestRes } from '~/server-middleware/routes/create-test/createTest'
import { ViewResultState } from '~/store/create-test/view-result'
import { UpdateResultAnswerForm } from '~/server-middleware/routes/create-test/updateResultAnswer'
import { GetRecruitRes } from '~/server-middleware/routes/create-test/getRecruit'
import { PublishTestRes } from '~/server-middleware/routes/create-test/publishTest'
import {
  UpdateTestDetailForm,
  UpdateTestDetailRes,
} from '~/server-middleware/routes/create-test/updateTestDetail'
import { GetCreateTestRes } from '~/server-middleware/routes/create-test/getCreateTest'

export const CreateTest: ServiceHandler<
  Record<string, any>,
  CreateTestRes
> = async (axios, payload) => {
  return await axios.$post('createTest/create', payload, validateStatus)
}

// get test for /create-test/?:id
export const GetCreateTest: ServiceHandler<string, GetCreateTestRes> = async (
  axios,
  id
) => {
  return await axios.$get(`/create-test/${id}`, {
    ...validateStatus,
  })
}

// get test for /create-test/recruit/?:id
export const GetRecruit: ServiceHandler<string, GetRecruitRes> = async (
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

export const UpdateResultAnswer: ServiceHandler<
  UpdateResultAnswerForm,
  number
> = async (axios, payload) => {
  return await axios.$post(
    '/create-test/view-result/updateAnswer',
    payload,
    validateStatus
  )
}

// publish test
export const PublishTest: ServiceHandler<string, PublishTestRes> = async (
  axios,
  id
) => {
  return await axios.$post('/create-test/publish', { id }, validateStatus)
}

// update test detail
export const UpdateTestDetail: ServiceHandler<
  UpdateTestDetailForm,
  UpdateTestDetailRes
> = async (axios, payload) => {
  return await axios.$patch('/create-test/updateDetail', payload, {
    ...validateStatus,
    progress: false,
  })
}
