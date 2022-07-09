import Joi from 'joi'
import { RequestHandler, Router } from 'express'
import DB from '../../../database'
import { sendError, sendFormattedError, sendSuccess } from '../../utils/sendRes'
import { ForgotPassword } from '../../../database/models/User/ForgotPassword'
import { User } from '../../../database/models/User/User'
import { uuidv4, inOneHour } from '../../../utils'
import { setAuthCookies } from '../../utils/cookies'

export interface ForgotPasswordForm {
  token: string
}

const formValidation: RequestHandler = (req, res, next) => {
  const query = req.query

  const schema = Joi.object({
    token: Joi.string()
      .uuid({
        version: 'uuidv4',
      })
      .rule({ message: 'Invalid token!' })
      .required(),
  } as Record<keyof ForgotPasswordForm, any>)

  const validate = schema.validate(query)

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
  return router.get('/auth/resetPassword', formValidation, async (req, res) => {
    let destroyToken = null as unknown as () => Promise<void>

    try {
      await DB.transaction(async (transaction) => {
        const { token } = req.query as unknown as ForgotPasswordForm

        // check that token exists
        const forgotPassword = await ForgotPassword.findByPk(token, {
          transaction,
        })

        if (forgotPassword) {
          destroyToken = async () =>
            await forgotPassword.destroy({ transaction })

          // check that the token isn't expired;
          if (forgotPassword.expires < Date.now()) {
            throw new Error(
              '{403} Token expired! Please try again'
            )
          }

          // check to see that the token's user exist;
          const findUser = await User.findByPk(forgotPassword.userId, {
            transaction,
          })

          if (!findUser) {
            throw new Error('{403} User not found!')
          }

          // All set. Confirm user, add a new user session, and delete token
          const session = uuidv4()

          await findUser.update({
            confirmed: true,
            confirmedAt: Date.now(),
            session: {
              ...findUser.session,
              [session]: {
                expires: inOneHour(),
                userAgent: req.headers['user-agent'] || 'null',
              },
            },
          })

          await findUser.save({ transaction })

          await findUser.reload({ transaction })

          await destroyToken()

          const userData = findUser.get()

          await setAuthCookies(req, res, findUser, session)

          sendSuccess(res, {
            message: {
              content: `Reset your password`,
              type: 'success',
            },
            data: userData,
          })
        } else {
          throw new Error('{403} Token not found!')
        }
      })
    } catch (err: any) {
      if (typeof destroyToken === 'function') {
        await destroyToken()
      }

      sendFormattedError(err, res)
    }
  })
}
