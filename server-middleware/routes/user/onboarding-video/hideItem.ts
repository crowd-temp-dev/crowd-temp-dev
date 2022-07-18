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
    index: Joi.number().integer().min(1).max(5).required(),
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
    '/hideOnboardingVideoItem',
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

          const { index } = req.body

          if (!rating) {
            rating = await OnboardingVideo.create(
              {
                userId,
                hiddenIndexes: [index],
              },
              { transaction }
            )
          } else {
            await rating.update({
              hiddenIndexes: [...rating.hiddenIndexes, index as number],
            })
          }

          await rating.save({ transaction })

          const {
            main,
            video1,
            video2,
            video3,
            video4,
            video5,
            hiddenIndexes,
          } = rating?.get()

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
