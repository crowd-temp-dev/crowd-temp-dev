import { RequestHandler, Router } from 'express'
import Joi from 'joi'
import { authenticate } from '../../utils/middleware'
import { loggedInMessage } from '../../utils'
import { clearAuthCookies } from '../../utils/cookies'
import { sendError, sendSuccess } from '../../utils/sendRes'
import type { User } from '~/database/models/User/User'

const formValidation: RequestHandler = (req, res, next) => {
  const body = req.body

  const schema = Joi.object({})

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
  return router.get('/auth/reload', formValidation, authenticate, (_, res) => {
    // at this point, a user exists in the res.
    // Sha check if it doesnt and send error;

    const user = res.get('$user')

    if (user) {
      try {
        const data = JSON.parse(user) as User

        sendSuccess(res, {
          data,
          message: loggedInMessage(data),
        })
      } catch (err) {
        clearAuthCookies(res)

        sendError(res, {
          status: 401,
          message: {
            content: err?.message || 'Session not found!',
            type: 'error',
          },
        })
      }
    }
  })
}
