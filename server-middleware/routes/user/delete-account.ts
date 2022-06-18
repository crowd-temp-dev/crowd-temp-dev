import { RequestHandler, Router } from 'express'
import Joi from 'joi'
import { authMiddleware } from '../../utils/middleware'
import { clearAuthCookies } from '../../utils/cookies'
import { sendError, sendFormattedError, sendSuccess } from '../../utils/sendRes'
import { user } from '../../utils/validation'
import { User } from '../../../database/models/User/User'
import DB from '../../../database'
import { matchPassword } from '../../../database/utils'
import mailer from '../../email'

export interface DeleteAccountForm {
  confirm: string
  password: string
}

const formValidation: RequestHandler = (req, res, next) => {
  const body = req.body

  const schema = Joi.object({
    confirm: user.confirmDeleteAccount.required(),
    password: user.password.required(),
  } as Record<keyof DeleteAccountForm, any>)

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
  return router.delete(
    '/auth/user',
    formValidation,
    authMiddleware,
    async (req, res) => {
      const { userId } = req.signedCookies

      try {
        if (!userId) {
          throw new Error('{401} You must be logged!')
        }

        await DB.transaction(async (transaction) => {
          // check that the user exist
          const user = await User.findByPk(userId, {
            transaction,
          })

          if (user) {
            if (/^fakeuser(?:-[1-5])?@unbug.crowd/.test(user.email)) {
              throw new Error("{403} You can't delete a dummy account!")
            }

            const passwordMatch = await matchPassword(
              req.body.password,
              user.password
            )

            if (passwordMatch) {
              await user.destroy({ transaction })

              clearAuthCookies(res)

              mailer.sendMail({
                from: 'UnbugQA',
                to: user.email,
                subject: 'Account deleted',
                html: `<div>
                      <p>
                        Hi ${user.name}! We are sorry to see you go.
                      </p>
                    </div>`,
              })

              sendSuccess(res, {
                data: [],
                message: {
                  content: 'Account deleted!',
                  type: 'success',
                  duration: 5000,
                },
              })
            } else {
              throw new Error('{403} Password is incorrect!')
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
