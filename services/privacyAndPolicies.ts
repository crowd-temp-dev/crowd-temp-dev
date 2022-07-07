import { ServiceHandler } from './type'
import { validateStatus } from './utils'
import { PrivacyAndPolicy } from '~/database/models/PrivacyAndPolicy/PrivacyAndPolicies'

export const GetPrivacyAndPolicies: ServiceHandler<
  null,
  PrivacyAndPolicy[]
> = async (axios) => {
  return await axios.$get(`/privacyAndPolicies`, {
    ...validateStatus,
  })
}
