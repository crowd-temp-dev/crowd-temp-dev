import Joi from 'joi'
import { RequestHandler, Router } from 'express'
import { sendError, sendFormattedError, sendSuccess } from '../../utils/sendRes'
import { setAuthCookies } from '../../utils/cookies'
import DB from '../../../database'
import { User } from '../../../database/models/User/User'

export interface LogoutForm {
  endAllSession?: boolean
  token?: string
  id?: string
}

const formValidation: RequestHandler = (req, res, next) => {
  const schema = Joi.object({
    endAllSession: Joi.boolean(),
    token: Joi.string().uuid({ version: 'uuidv4' }),
    id: Joi.string().uuid({ version: 'uuidv4' }),
  } as Record<keyof LogoutForm, any>)

  const validate = schema.validate(req.body)

  if (validate.error) {
    return sendError(res, {
      message: {
        type: 'error',
        content: validate.error.message || 'Invalid fields',
      },
      status: 400,
    })
  }

  next()
}

export default function (router: Router) {
  return router.post('/auth/logout', formValidation, async (req, res) => {
    try {
      const { userId, session } = req.signedCookies

      const {
        token: _token,
        id: reqUserId,
        endAllSession,
      } = req.body as LogoutForm

      await DB.transaction(async (transaction) => {
        const sendSuccessRes = () => {
          sendSuccess(res, {
            data: [],
            message: {
              content: endAllSession
                ? 'Logged out all devices!'
                : 'Logged out!',
              type: 'success',
            },
          })
        }

        if (!userId) {
          sendSuccessRes()
        }
        else {
          // find user
          const user = await User.findOne({
            where: {
              id: userId,
            },
            transaction,
          })

          if (user) {
            // if token or reqUserId exists, and endAllSession exists,
            // confirm token is a valid action, and reqUserId matches,
            // then delete that action's token
            if (endAllSession) {
              const token = _token || ''

              if (
                userId !== reqUserId ||
                !(token in user.action) ||
                Date.now() > user.action[token]
              ) {
                throw new Error('{403} You are not allowed to do that!')
              } else {
                const newAction = { ...user.get().action }

                delete newAction[token]

                await user.update({
                  action: newAction,
                })
              }
            }

            const newSession = { ...user.get().session }

            delete newSession[session]

            await user.update({
              session: endAllSession ? {} : newSession,
            })

            await user.save({ transaction })

            await setAuthCookies(req, res, transaction, null, null)

            sendSuccessRes()
          } else {
            throw new Error('{404} User not found!')
          }
        }
      })
    } catch (err) {
      sendFormattedError(err, res)
    }
  })
}
