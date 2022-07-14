import Joi from 'joi'
import { RequestHandler, Router } from 'express'
import {
  sendError,
  sendFormattedError,
  sendSuccess,
} from '../../../utils/sendRes'
import DB from '../../../../database'
import { authenticate } from '../../../utils/middleware'
import { OnboardingVideo } from '../../../../database/models/OnboardingVideo'

const formValidation: RequestHandler = (req, res, next) => {
  const body = req.body

  const schema = Joi.object({
    main: Joi.number().min(-2).max(1),
    video1: Joi.number().min(-2).max(1),
    video2: Joi.number().min(-2).max(1),
    video3: Joi.number().min(-2).max(1),
    video4: Joi.number().min(-2).max(1),
    video5: Joi.number().min(-2).max(1),
  })

  const validate = schema.validate(body)

  if (validate.error) {
    return sendError(res, {
      message: {
        content: validate.error.message || 'Invalid credentials',
        type: 'error',
      },
      status: 400,
    })
  }

  next()
}

export default function (router: Router) {
  return router.post(
    '/onboardingVideoRating',
    formValidation,
    authenticate,
    async (req, res) => {
      try {
        await DB.transaction(async (transaction) => {
          const { userId } = req.signedCookies

          if (!userId) {
            throw new Error('{401} You must be signed in!')
          }

          let rating = await OnboardingVideo.findOne({
            where: {
              userId,
            },
            transaction,
          })

          if (!rating) {
            rating = await OnboardingVideo.create(
              {
                userId,
                ...req.body,
              },
              { transaction }
            )
          } else {
            await rating.update({
              ...req.body,
            })
          }

          await rating.save({ transaction })

          console.log({ rating: rating.get(), req: req.body })

          const { main, video1, video2, video3, video4, video5 } = rating?.get()

          sendSuccess(res, {
            data: {
              main,
              video1,
              video2,
              video3,
              video4,
              video5,
            },
          })
        })
      } catch (err) {
        sendFormattedError(err, res)
      }
    }
  )
}
