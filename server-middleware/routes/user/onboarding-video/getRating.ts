import { Router } from 'express'
import { sendFormattedError, sendSuccess } from '../../../utils/sendRes'
import DB from '../../../../database'
import { authenticate } from '../../../utils/middleware'
import { OnboardingVideo } from '../../../../database/models/OnboardingVideo'

export default function (router: Router) {
  return router.get(
    '/onboardingVideoRating',
    authenticate,
    async (req, res) => {
      try {
        await DB.transaction(async (transaction) => {
          const { userId } = req.signedCookies

          if (!userId) {
            throw new Error('{401} You must be signed in!')
          }

          const rating = await OnboardingVideo.findByPk(userId, {
            transaction,
          })

          const {
            main,
            video1,
            video2,
            video3,
            video4,
            video5,
            hiddenIndexes,
          } = rating?.get() || {
            main: -1,
            video1: -1,
            video2: -1,
            video3: -1,
            video4: -1,
            video5: -1,
            hiddenIndexes: [],
          }

          sendSuccess(res, {
            data: {
              main,
              video1,
              video2,
              video3,
              video4,
              video5,
              hiddenIndexes,
            },
          })
        })
      } catch (err) {
        sendFormattedError(err, res)
      }
    }
  )
}
