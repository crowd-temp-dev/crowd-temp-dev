import { ServiceHandler } from './type'
import { validateStatus } from './utils'
import { GetAllTestsForm, GetAllTestsRes } from '~/server-middleware/routes/view-test/getAllTests'

export const GetAllTests: ServiceHandler<GetAllTestsForm, GetAllTestsRes> = async (
  axios,
  // payload
) => {
  return await axios.$get('get-test/getAll', {
    ...validateStatus,
    progress: false,
  })
}
