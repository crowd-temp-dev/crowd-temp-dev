import { ServiceHandler } from './type'
import { validateStatus } from './utils'
import {
  GetAllTestsForm,
  GetAllTestsRes,
} from '~/server-middleware/routes/test-cRUD/getAllTests'
import { routeQuery } from '~/server-middleware/utils'

export const GetAllTests: ServiceHandler<
  GetAllTestsForm,
  GetAllTestsRes
> = async (axios, payload) => {
  return await axios.$get(`get-test/getAll?${routeQuery(payload)}`, {
    ...validateStatus,
    progress: false,
  })
}
