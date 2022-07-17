import Joi from 'joi'
import { RequestHandler, Router } from 'express'
import { uuidv4 } from '../../../utils/validation'
import {
  sendError,
  sendFormattedError,
  sendSuccess,
} from '../../../utils/sendRes'
import DB from '../../../../database'
import { User } from '../../../../database/models/User/User'
import { UserToken } from '../../../../database/models/User/UserToken'
import { sendVerificationEmail } from './utils'

const formValidation: RequestHandler = (req, res, next) => {
  const body = req.body

  const schema = Joi.object({
    id: uuidv4.required(),
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
    '/auth/resendVerificationEmail',
    formValidation,
    async (req, res) => {
      try {
        await DB.transaction(async (transaction) => {
          const userId = req.body.id

          const user = await User.findByPk(userId, { transaction })

          if (!user) {
            throw new Error('{404} User not found!')
          }

          if (user.confirmed) {
            throw new Error('{403} Account already confirmed!')
          }

          // clear any previous token
          await UserToken.destroy({
            where: {
              userId: user.id,
              type: 'confirm_account',
            },
            transaction,
          })

          // add new token
          const confirmAccount = await UserToken.create(
            {
              userId: user.id,
              type: 'confirm_account',
            },
            { transaction }
          )

          if (confirmAccount) {
            const getToken = confirmAccount.get().id as string

            try {
              const sendConfirmation = await sendVerificationEmail(
                user,
                getToken
              )

              if (sendConfirmation.accepted) {
                sendSuccess(res, {
                  data: {
                    id: user.id,
                    name: `${user.firstName} ${user.lastName}`,
                  },
                  message: {
                    type: 'success',
                    content: 'Verification sent!',
                    duration: 5000,
                  },
                })
              }
            } catch (err) {
              console.log({
                err: {
                  type: 'Sign up email error',
                  err,
                  msg: err?.message || 'No error message',
                },
              })

              throw new Error('{500} Error sending verification email.')
            }
          } else {
            throw new Error(`{409} Error sending verification email.`)
          }
        })
      } catch (err: any) {
        console.log(err.message)

        sendFormattedError(err, res)
      }
    }
  )
}
