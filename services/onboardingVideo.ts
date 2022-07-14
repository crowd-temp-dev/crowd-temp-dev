import { ServiceHandler } from './type'
import { validateStatus } from './utils'
import { OnboardingVideo } from '~/database/models/OnboardingVideo'

export const GetOnboardingVideoRating: ServiceHandler<
  null,
  OnboardingVideo
> = async (axios) => {
  return await axios.$get('/onboardingVideoRating', {
    ...validateStatus,
    progress: false,
  })
}

export const RateOnboardingVideo: ServiceHandler<
  {
    main?: number
    video1?: number
    video2?: number
    video3?: number
    video4?: number
    video5?: number
  },
  OnboardingVideo
> = async (axios, payload) => {
  return await axios.$post('/onboardingVideoRating', payload, validateStatus)
}
