import { ServiceHandler } from './type'
import { validateStatus } from './utils'
import { GetUserRes } from '~/server-middleware/routes/answer-test/getAnsUser'

export const GetAnsUser: ServiceHandler<string, GetUserRes> = async (
  axios,
  id
) => {
  return await axios.$get(`/answer-test/getUser/${id}`, validateStatus)
}

export const BeginTest: ServiceHandler<
  {
    shareLink: string
    name: string
  },
  {
    username: string
    nextIndex: `${number}${string}` | 'done'
  }
> = async (axios, payload) => {
  return await axios.$post(`/answer-test/beginTest`, payload, validateStatus)
}

export const ConfirmSection: ServiceHandler<
  {
    value: any[]
  },
  {
    nextIndex: `${number}${string}` | 'done'
  }
> = async (axios, payload) => {
  return await axios.$post(
    `/answer-test/confirmSection`,
    payload,
    validateStatus
  )
}

export const AnswerQuestion: ServiceHandler<
  {
    shareLink: string
    values: string[]
  },
  {
    sendTo: string
  }
> = async (axios, payload) => {
  return await axios.$post(
    `/answer-test/answerQuestion`,
    payload,
    validateStatus
  )
}
