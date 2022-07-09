import Joi from 'joi'
import { RequestHandler, Router } from 'express'
import { user as userValidation } from '../../utils/validation'
import { sendError, sendFormattedError, sendSuccess } from '../../utils/sendRes'
import { authenticate } from '../../utils/middleware'
import DB from '../../../database'
import { User } from '../../../database/models/User/User'
import { hashPassword } from '../../../database/utils'
import { setAuthCookies } from '../../utils/cookies'
import mailer from '../../email'

export interface ResetPasswordForm {
  password: string
  confirmPassword: string
}

const formValidation: RequestHandler = (req, res, next) => {
  const body = req.body

  const schema = Joi.object({
    password: userValidation.password.required(),
    confirmPassword: userValidation.password
      .valid(Joi.ref('password'))
      .required(),
  } as Record<keyof ResetPasswordForm, any>)

  const validate = schema.validate(body)

  if (validate.error) {
    return sendError(res, {
      message: {
        type: 'error',
        content: validate.error.message || 'Invalid credentials',
      },
      status: 400,
    })
  }

  next()
}

export default function (router: Router) {
  return router.post(
    '/auth/resetPassword',
    formValidation,
    authenticate,
    async (req, res) => {
      const { password: _password } = req.body as ResetPasswordForm

      const { userId } = req.signedCookies

      const password = await hashPassword(_password)

      try {
        if (password) {
          await DB.transaction(async (transaction) => {
            const user = await User.findByPk(userId, {
              transaction,
            })

            if (user) {
              if (user.provider !== 'email') {
                throw new Error(
                  `{403} ${user.provider} manages account password!`
                )
              }

              await user.update({
                password,
              })

              await user.save({ transaction })

              await setAuthCookies(req, res, user)

              mailer.sendMail({
                from: 'UnbugQA',
                to: user.email,
                subject: 'Password changed!',
                html: `<div>
                      <p>
                        Hi ${user.name}! Your password has been changed!.
                      </p>

                      <p>
                        <strong>Request from: </strong>
                        <em>
                          ${req.headers['user-agent']}
                        </em>
                      </p>

                      <p>
                        <strong>Request at: </strong>
                        <em>
                          ${new Date().toLocaleDateString('en', {
                            hour: '2-digit',
                            minute: '2-digit',
                            dateStyle: 'full',
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </em>
                      </p>
                    </div>`,
              })

              sendSuccess(res, {
                data: user,
                message: {
                  content: 'Password changed!',
                  type: 'success',
                },
              })
            } else {
              throw new Error('{404} User not found!')
            }
          })
        } else {
          throw new Error("Can't reset your password now. Try again")
        }
      } catch (err) {
        sendFormattedError(err, res)
      }
    }
  )
}
