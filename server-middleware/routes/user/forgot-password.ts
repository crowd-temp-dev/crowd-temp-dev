import Joi from 'joi'
import { RequestHandler, Router } from 'express'
import DB from '../../../database'
import { sendError, sendFormattedError, sendSuccess } from '../../utils/sendRes'
import { ForgotPassword } from '../../../database/models/User/ForgotPassword'
import { User } from '../../../database/models/User/User'
import { oneMinute, inOneDay, capitalize } from '../../../utils'
import { user } from '../../utils/validation'
import mailer from '../../email'

export interface ForgotPasswordForm {
  email: string
}

const formValidation: RequestHandler = (req, res, next) => {
  const body = req.body

  const schema = Joi.object({
    email: user.email.required(),
  } as Record<keyof ForgotPasswordForm, any>)

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

// sends steps to reset password
export default function (router: Router) {
  return router.post(
    '/auth/forgotPassword',
    formValidation,
    async (req, res) => {
      try {
        await DB.transaction(async (transaction) => {
          const { email } = req.body as ForgotPasswordForm

          // check that the user exists
          const user = await User.findOne({
            where: { email },
            transaction,
          })

          if (user) {
            if (user.provider !== 'email') {
              throw new Error(
                `{403} ${capitalize(user.provider)} manages account password!`
              )
            }

            // check that the user hasn't made this request a minute ago
            const previousForgotPasswordReq = await ForgotPassword.findOne({
              where: {
                userId: user.id,
              },
              transaction,
            })

            if (previousForgotPasswordReq) {
              const { tryAgainIn } = previousForgotPasswordReq

              if (tryAgainIn > Date.now()) {
                const retryTimeout = Math.floor(
                  (tryAgainIn - Date.now()) / 1000
                )

                throw new Error(
                  `{403} Please try again in ${retryTimeout} second${
                    tryAgainIn > 1 ? 's' : ''
                  }`
                )
              }
            }

            await ForgotPassword.destroy({
              where: { userId: user.id },
              transaction,
            })

            const forgotPassword = await ForgotPassword.create(
              {
                userId: user.id,
                tryAgainIn: Date.now() + oneMinute,
                expires: inOneDay(),
              },
              { transaction }
            )

            mailer
              .sendMail({
                to: email,
                from: 'UnbugQA',
                subject: 'Reset your password',
                html: `<div>
                      <p>
                        Hi ${user.firstName}! Please follow the link below to reset your password.
                      </p>
                      <p>
                        <strong>
                          <a href="${process.env.CLIENT_ORIGIN}/auth/reset-password?token=${forgotPassword.id}">
                            Reset password
                          </a>
                        </strong>
                      </p>
                    </div>`,
              })
              .then(() => {
                sendSuccess(res, {
                  message: {
                    content: 'Reset your password',
                    type: 'success',
                  },
                  data: { forgotPassword, now: Date.now() },
                })
              })
              .catch(() => {
                throw new Error('{409} Error sending a reset link. Try again.')
              })
          } else {
            throw new Error('{404} User not found!')
          }
        })
      } catch (err: any) {
        sendFormattedError(err, res)
      }
    }
  )
}
