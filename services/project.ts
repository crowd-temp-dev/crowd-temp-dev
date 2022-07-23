import { ServiceHandler } from './type'
import { validateStatus } from './utils'
import { ProjectRes } from '~/server-middleware/routes/project/project'
import { UpdateResultAnswerForm } from '~/server-middleware/routes/project/updateResultAnswer'
import { GetRecruitRes } from '~/server-middleware/routes/project/getProjectRecruit'
import { PublishTestRes } from '~/server-middleware/routes/project/publishTest'
import {
  UpdateTestDetailForm,
  UpdateTestDetailRes,
} from '~/server-middleware/routes/project/updateTestDetail'
import { GetProjectRes } from '~/server-middleware/routes/project/getCreateProjectTest'
import { TestSuiteViewResultState } from '~/store/projectSuite/viewResult'

export const Project: ServiceHandler<
  Record<string, any>,
  ProjectRes
> = async (axios, payload) => {
  return await axios.$post('project/create', payload, validateStatus)
}

// get test for /project/?:id
export const GetProject: ServiceHandler<string, GetProjectRes> = async (
  axios,
  id
) => {
  return await axios.$get(`/project/${id}`, {
    ...validateStatus,
  })
}

// get test for /project/recruit/?:id
export const GetRecruit: ServiceHandler<string, GetRecruitRes> = async (
  axios,
  id
) => {
  return await axios.$get(`/project/recruit/${id}`, {
    ...validateStatus,
  })
}

// get test for /project/view-result/?:id
export const GetViewResult: ServiceHandler<
  string,
  {
    responses: TestSuiteViewResultState['responses']
    questions: TestSuiteViewResultState['questions']
    answers: TestSuiteViewResultState['answers']
  }
> = async (axios, id) => {
  return await axios.$get(`/project/view-result/${id}`, {
    ...validateStatus,
  })
}

export const UpdateResultAnswer: ServiceHandler<
  UpdateResultAnswerForm,
  number
> = async (axios, payload) => {
  return await axios.$post(
    '/project/view-result/updateAnswer',
    payload,
    validateStatus
  )
}

// publish test
export const PublishTest: ServiceHandler<string, PublishTestRes> = async (
  axios,
  id
) => {
  return await axios.$post('/project/publish', { id }, validateStatus)
}

// update test detail
export const UpdateTestDetail: ServiceHandler<
  UpdateTestDetailForm,
  UpdateTestDetailRes
> = async (axios, payload) => {
  return await axios.$patch('/project/updateDetail', payload, {
    ...validateStatus,
    progress: false,
  })
}
