import Joi from 'joi'
import { RequestHandler, Router } from 'express'
import { sendError, sendFormattedError, sendSuccess } from '../../utils/sendRes'
import DB from '../../../database'
import { User } from '../../../database/models/User/User'
import { authenticate } from '../../utils/middleware'
import { UserOnboard } from '../../../database/models/User/UserOnboarding'
import { setAuthCookies } from '../../utils/cookies'

export interface OnboardForm {
  useCase: string
  role: string
  companyName?: string
  companySize?: string
  referrer: string
}

const formValidation: RequestHandler = (req, res, next) => {
  const body = req.body

  const schema = Joi.object({
    useCase: Joi.string().required(),
    role: Joi.string().required(),
    companyName: Joi.string().min(0),
    companySize: Joi.string().min(0),
    referrer: Joi.string().required(),
  } as Record<keyof OnboardForm, any>)

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
    '/user/setup-account',
    formValidation,
    authenticate,
    async (req, res) => {
      try {
        await DB.transaction(async (transaction) => {
          const { userId } = req.signedCookies

          if (!userId) {
            throw new Error('{401} You must be logged in!')
          }

          // find user
          const user = await User.findByPk(userId, {
            transaction,
          })

          if (user) {
            const { useCase, role, companyName, companySize, referrer } =
              req.body as OnboardForm

            if (user.onboarded) {
              throw new Error('{405} Already onboarded!')
            }

            const survey = await UserOnboard.create(
              {
                id: user.id,
                useCase,
                role,
                companyName: companyName || null,
                companySize: companySize || null,
                referrer,
              },
              { transaction }
            )

            if (!survey) {
              throw new Error('{409} Error onboarding!')
            } else {
              await user.update({
                onboarded: true,
              })

              await user.save({ transaction })

              await setAuthCookies({
                req,
                res,
                transaction,
                userInstance: user,
              })

              sendSuccess(res, {
                data: user.get(),
              })
            }
          } else {
            throw new Error('{401} User not found!')
          }
        })
      } catch (err) {
        sendFormattedError(err, res)
      }
    }
  )
}
