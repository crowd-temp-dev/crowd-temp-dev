import Joi from 'joi'
import { RequestHandler, Router } from 'express'
import DB from '../../../database'
import { sendError, sendFormattedError, sendSuccess } from '../../utils/sendRes'
import { ConfirmAccount } from '../../../database/models/User/ConfirmAccount'
import { User } from '../../../database/models/User/User'
import { uuidv4, inOneHour } from '../../../utils'
import { setAuthCookies } from '../../utils/cookies'

export interface ConfirmAccountForm {
  token: string
}

const middleware: RequestHandler = (req, res, next) => {
  const body = req.body

  const schema = Joi.object({
    token: Joi.string()
      .uuid({
        version: 'uuidv4',
      })
      .rule({ message: 'Invalid token!' })
      .required(),
  } as Record<keyof ConfirmAccountForm, any>)

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
  return router.post('/auth/confirmAccount', middleware, async (req, res) => {
    let destroyToken = null as unknown as () => Promise<void>

    try {
      await DB.transaction(async (transaction) => {
        const { token } = req.body as ConfirmAccountForm

        // check that token exists
        const confirmAccount = await ConfirmAccount.findByPk(token, {
          transaction,
        })

        if (confirmAccount) {
          destroyToken = async () =>
            await confirmAccount.destroy({ transaction })

          // check that the token isn't expired;
          if (confirmAccount.expires < Date.now()) {
            throw new Error(
              '{403} Token expired! Please re-create your account'
            )
          }

          // check to see that the token's user exist;
          const findUser = await User.findByPk(confirmAccount.userId, {
            transaction,
          })

          if (!findUser) {
            throw new Error('{404} User not found!')
          }

          // check that user isn't confirmed
          if (findUser.confirmed) {
            throw new Error('{403} Account is already confirmed!')
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

          await setAuthCookies(req, res, findUser)

          sendSuccess(res, {
            message: {
              content: `Hi ${userData.name}! Welcome to Crowd!`,
              type: 'success',
            },
            data: userData,
          })
        } else {
          throw new Error('{404} Token not found!')
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
