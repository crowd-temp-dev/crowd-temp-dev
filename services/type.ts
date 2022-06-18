import { NuxtAxiosInstance } from '@nuxtjs/axios'
import { ApiResponse } from '~/types'

export type ServiceHandler<Payload, Return> = (
  axios: NuxtAxiosInstance,
  payload: Payload
) => Promise<ApiResponse<Return>>
