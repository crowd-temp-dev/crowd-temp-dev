import { RequestHandler, Router } from 'express'
import Joi from 'joi'
import { authenticate } from '../../utils/middleware'
import { setAuthCookies } from '../../utils/cookies'
import { sendError, sendFormattedError, sendSuccess } from '../../utils/sendRes'
import { user } from '../../utils/validation'
import { User } from '../../../database/models/User/User'
import DB from '../../../database'
import { hashPassword, matchPassword } from '../../../database/utils'
import { capitalize, inOneHour } from '../../../utils'

export interface ChangePasswordForm {
  currentPassword: string
  password: string
  confirmPassword: string
}

const formValidation: RequestHandler = (req, res, next) => {
  const body = req.body

  const schema = Joi.object({
    currentPassword: user.password.required(),
    password: user.password.required(),
    confirmPassword: user.password.valid(Joi.ref('password')).required(),
  } as Record<keyof ChangePasswordForm, any>)

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
  return router.patch(
    '/auth/changePassword',
    formValidation,
    authenticate,
    async (req, res) => {
      const { userId, session } = req.signedCookies

      try {
        if (!userId) {
          throw new Error('{401} You must be logged!')
        }

        await DB.transaction(async (transaction) => {
          const { currentPassword, password } = req.body

          // check that the user exist
          const user = await User.findByPk(userId, {
            transaction,
          })

          if (user) {
            if (user.provider !== 'email') {
              throw new Error(
                `{403} ${capitalize(user.provider)} manages account password!`
              )
            }

            const passwordMatch = await matchPassword(
              currentPassword,
              user.password
            )

            if (passwordMatch) {
              const hashedPassword = await hashPassword(password)

              if (hashedPassword) {
                await user.update({
                  password: hashedPassword,
                  // clear every other session
                  session: {
                    [session]: {
                      expires: inOneHour(),
                      userAgent: req.headers['user-agent'] || 'null',
                    },
                  },
                })

                await user.save({ transaction })

                await user.reload({ transaction })

                await setAuthCookies(req, res, user)

                sendSuccess(res, {
                  data: user.get(),
                  message: {
                    content: 'Password changed!',
                    type: 'success',
                    duration: 5000,
                  },
                })
              } else {
                throw new Error('{409} Error updating password. Try again.')
              }
            } else {
              throw new Error('{403} Current password is incorrect!')
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
