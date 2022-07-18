import { ServiceHandler } from './type'
import { validateStatus } from './utils'
import {
  GetAllTestsForm,
  GetAllTestsRes,
} from '~/server-middleware/routes/test-cRUD/getAllTests'
import { routeQuery } from '~/server-middleware/utils'
import { DeleteTestForm } from '~/server-middleware/routes/test-cRUD/deleteTest'

export const GetAllTests: ServiceHandler<
  GetAllTestsForm,
  GetAllTestsRes
> = async (axios, payload) => {
  return await axios.$get(`get-test/getAll?${routeQuery(payload)}`, {
    ...validateStatus,
    progress: false,
  })
}

export const DeleteTest: ServiceHandler<
  DeleteTestForm,
  DeleteTestForm
> = async (axios, data) => {
  return await axios.$delete('/deleteTest', {
    data,
    ...validateStatus,
  })
}
